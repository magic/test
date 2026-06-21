import fs from '@magic/fs'
import path from 'node:path'
import crypto from 'node:crypto'

const CACHE_DIR = 'node_modules/.magic-test-cache'
const COMPILED_DIR = path.join(CACHE_DIR, 'compiled')
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

// Compute SHA-256 hash of file content
async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8')
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Get relative cache path for a source file
function getCachePath(sourcePath: string): string {
  const rel = path.relative(process.cwd(), sourcePath).replace(/\.svelte$/, '.js')
  return path.join(COMPILED_DIR, rel)
}

export async function loadManifest(): Promise<CacheManifest | null> {
  try {
    const data = await fs.readFile(MANIFEST_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function saveManifest(manifest?: CacheManifest): Promise<void> {
  let m: CacheManifest | null | undefined = manifest
  if (!m) {
    // Load current manifest and save
    m = await loadManifest()
  }
  if (!m) {
    return
  }
  await fs.mkdirp(CACHE_DIR)
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(m, null, 2))
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

  // Compute current hash
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
  }

  const stats = await fs.stat(sourcePath)
  const hash = await hashFile(sourcePath)

  // Save compiled file
  const compiledPath = getCachePath(sourcePath)
  await fs.mkdirp(path.dirname(compiledPath))
  await fs.writeFile(compiledPath, compiledJs)

  // Update manifest
  manifest.sources[sourcePath] = { mtime: stats.mtimeMs, hash }

  // Save manifest to disk immediately
  await saveManifest(manifest)
}

export async function clearCache(): Promise<void> {
  try {
    await fs.rmrf(CACHE_DIR)
  } catch {
    // Ignore
  }
}

export function getCacheDir(): string {
  return CACHE_DIR
}
