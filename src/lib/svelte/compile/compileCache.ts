import fs from '@magic/fs'
import crypto from 'node:crypto'

import { CWD } from '../../../constants.ts'

interface CompileCacheEntry {
  sourceMtime: number
  contentHash: string
  compiledPath: string
}

// Persistent cache keyed by source file path
const cacheFile = 'test/.tmp/.compile-cache.json'
let cache: Map<string, CompileCacheEntry> = new Map()
let cacheLoaded = false

// Load cache from disk
export async function loadCompileCache(): Promise<void> {
  if (cacheLoaded) return
  cacheLoaded = true

  try {
    const data = await fs.readFile(cacheFile, 'utf-8')
    const entries = JSON.parse(data) as Record<string, CompileCacheEntry>
    cache = new Map(Object.entries(entries))
  } catch {
    // No cache file yet
  }
}

// Save cache to disk
export async function saveCompileCache(): Promise<void> {
  try {
    const entries: Record<string, CompileCacheEntry> = {}
    for (const [key, value] of cache) {
      entries[key] = value
    }
    await fs.mkdirp('test/.tmp')
    await fs.writeFile(cacheFile, JSON.stringify(entries, null, 2))
  } catch {
    // Ignore save errors
  }
}

// Check if file needs recompilation
export async function isCacheValid(
  sourcePath: string,
  compiledPath: string,
  sourceContent: string,
): Promise<boolean> {
  await loadCompileCache()

  const stats = await fs.stat(sourcePath)
  const entry = cache.get(sourcePath)
  const contentHash = crypto.createHash('sha256').update(sourceContent).digest('hex')

  // Cache miss - needs compilation
  if (!entry) {
    return false
  }

  // Source file modified - needs recompilation
  if (entry.sourceMtime !== stats.mtimeMs) {
    return false
  }

  // Source content changed - needs recompilation
  if (entry.contentHash !== contentHash) {
    return false
  }

  // Check if compiled file exists
  if (!(await fs.exists(compiledPath))) {
    return false
  }

  return true
}

// Record a successful compilation
export function recordCompile(sourcePath: string, sourceContent: string, compiledPath: string): void {
  const stats = fs.statSync ? { mtimeMs: fs.statSync(sourcePath).mtimeMs } : { mtimeMs: Date.now() }
  const contentHash = crypto.createHash('sha256').update(sourceContent).digest('hex')

  cache.set(sourcePath, {
    sourceMtime: stats.mtimeMs,
    contentHash,
    compiledPath,
  })
}

// Clear cache for a specific file
export function invalidateCache(sourcePath: string): void {
  cache.delete(sourcePath)
}

// Clear entire cache
export function clearCompileCache(): void {
  cache.clear()
}

// Get cache stats
export function getCacheStats(): { entries: number; paths: string[] } {
  return {
    entries: cache.size,
    paths: [...cache.keys()],
  }
}
