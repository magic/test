import fs from '@magic/fs'
import path from 'node:path'
import crypto from 'node:crypto'

import { LRUCache } from './LRUCache.js'
import { clearResolveTransformCache } from './resolveTransformCache.js'

import { CACHE_DIR } from '../../constants.js'

const MANIFEST_FILE = path.join(CACHE_DIR, 'manifest.json')

interface SourceEntry {
  mtime: number
  hash: string
}

interface CacheManifest {
  version: number
  svelteVersion: string
  sources: Record<string, SourceEntry>
}

// In-memory caches for performance
let manifestCache: CacheManifest | null = null
// The on-disk mtime the in-memory manifest was loaded from. Parallel test
// workers share the manifest file: reload whenever another worker has
// written a newer version so cache entries recorded mid-run are visible.
let manifestMtime = 0
const hashCache = new LRUCache<string>(4096)

// Atomic write: a concurrent reader (sibling worker) must never observe a
// truncated/partial file — write to a unique temp name, then rename (POSIX
// renames are atomic).
export async function writeAtomic(filePath: string, content: string): Promise<void> {
  const tmp = `${filePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`
  await fs.writeFile(tmp, content)
  try {
    await fs.rename(tmp, filePath)
  } catch (e) {
    try {
      await fs.unlink(tmp)
    } catch {
      // temp cleanup is best-effort
    }
    throw e
  }
}

// Compute SHA-256 hash of file content (with caching)
async function hashFile(filePath: string): Promise<string> {
  const cached = hashCache.get(filePath)
  if (cached) {
    return cached
  }

  const content = await fs.readFile(filePath, 'utf-8')
  const hash = crypto.createHash('sha256').update(content).digest('hex')
  hashCache.set(filePath, hash)
  return hash
}

// Get relative cache path for a source file
function getCachePath(sourcePath: string): string {
  const rel = path.relative(process.cwd(), sourcePath).replace(/\.svelte$/, '.svelte.js')
  return path.join(CACHE_DIR, rel)
}

export async function loadManifest(): Promise<CacheManifest | null> {
  try {
    const stats = await fs.stat(MANIFEST_FILE)
    if (manifestCache && stats.mtimeMs === manifestMtime) {
      return manifestCache
    }
    const data = await fs.readFile(MANIFEST_FILE, 'utf-8')
    manifestCache = JSON.parse(data)
    manifestMtime = stats.mtimeMs
    return manifestCache
  } catch {
    return null
  }
}

export async function saveManifest(manifest?: CacheManifest): Promise<void> {
  // Merge with the latest on-disk manifest so concurrent writers (parallel
  // test workers) don't clobber each other's entries: a stale in-memory copy
  // must not drop entries another worker recorded in the meantime.
  const latest = await loadManifest()
  let m: CacheManifest | null | undefined = manifest
  if (!m) {
    m = latest
  } else if (latest) {
    for (const [key, value] of Object.entries(latest.sources)) {
      if (!(key in m.sources)) {
        m.sources[key] = value
      }
    }
  }
  if (!m) {
    return
  }
  await fs.mkdirp(CACHE_DIR)
  await writeAtomic(MANIFEST_FILE, JSON.stringify(m, null, 2))
}

export async function getCachedCompile(
  sourcePath: string,
): Promise<{ js: string; css: unknown } | null> {
  const m = await loadManifest()
  if (!m) {
    return null
  }

  const entry = m.sources[sourcePath]
  if (!entry) {
    return null
  }

  // Compute and cache hash
  const currentHash = await hashFile(sourcePath)

  // Check if hash matches
  if (currentHash !== entry.hash) {
    return null
  }

  // Check compiled file exists
  const compiledPath = getCachePath(sourcePath)
  if (!(await fs.exists(compiledPath))) {
    return null
  }

  const js = await fs.readFile(compiledPath, 'utf-8')
  return { js, css: null }
}

export async function recordCompile(sourcePath: string, compiledJs: string): Promise<void> {
  let manifest = await loadManifest()

  if (!manifest) {
    // Initialize new manifest
    const pkgPath = path.join(process.cwd(), 'node_modules/svelte/package.json')
    let svelteVersion = 'unknown'
    try {
      const pkgData = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(pkgData)
      svelteVersion = pkg.version
    } catch {
      // Use unknown version
    }

    manifest = {
      version: 1,
      svelteVersion,
      sources: {},
    }
    manifestCache = manifest
  }

  // mtime is used for tracking, not for invalidation (hash is authoritative)
  const stats = await fs.stat(sourcePath)
  const hash = await hashFile(sourcePath)

  // Save compiled file
  const compiledPath = getCachePath(sourcePath)
  await fs.mkdirp(path.dirname(compiledPath))
  await writeAtomic(compiledPath, compiledJs)

  // Update manifest
  manifest.sources[sourcePath] = { mtime: stats.mtimeMs, hash }

  // Save manifest to disk
  await saveManifest(manifest)
}

export async function clearCache(): Promise<void> {
  try {
    await fs.rmrf(CACHE_DIR)
  } catch {
    // Ignore
  }
  manifestCache = null
  manifestMtime = 0
  hashCache.clear()
  await clearResolveTransformCache()
}

export function getCacheDir(): string {
  return CACHE_DIR
}
