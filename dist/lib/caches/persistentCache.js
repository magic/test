import fs from '@magic/fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { LRUCache } from './LRUCache.js'
const CACHE_DIR = 'node_modules/.magic-test-cache'
const COMPILED_DIR = path.join(CACHE_DIR, 'compiled')
const MANIFEST_FILE = path.join(CACHE_DIR, 'manifest.json')
// In-memory caches for performance
let manifestCache = null
const hashCache = new LRUCache(500)
// Compute SHA-256 hash of file content (with caching)
async function hashFile(filePath) {
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
function getCachePath(sourcePath) {
  const rel = path.relative(process.cwd(), sourcePath).replace(/\.svelte$/, '.js')
  return path.join(COMPILED_DIR, rel)
}
export async function loadManifest() {
  if (manifestCache) {
    return manifestCache
  }
  try {
    const data = await fs.readFile(MANIFEST_FILE, 'utf-8')
    manifestCache = JSON.parse(data)
    return manifestCache
  } catch {
    return null
  }
}
export async function saveManifest(manifest) {
  let m = manifest
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
export async function getCachedCompile(sourcePath) {
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
export async function recordCompile(sourcePath, compiledJs) {
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
  await fs.writeFile(compiledPath, compiledJs)
  // Update manifest
  manifest.sources[sourcePath] = { mtime: stats.mtimeMs, hash }
  // Save manifest to disk
  await saveManifest(manifest)
}
export async function clearCache() {
  try {
    await fs.rmrf(CACHE_DIR)
  } catch {
    // Ignore
  }
  manifestCache = null
  hashCache.clear()
}
export function getCacheDir() {
  return CACHE_DIR
}
