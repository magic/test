import { LRUCache } from './LRUCache.js'
import fs from '@magic/fs'
// LRU cache for file stats (includes existence check)
const statsCache = new LRUCache(1000)
export async function statCached(filePath) {
  const cached = statsCache.get(filePath)
  if (cached) {
    return cached
  }
  try {
    const stats = await fs.stat(filePath)
    const result = { exists: true, mtime: stats.mtimeMs, size: stats.size }
    statsCache.set(filePath, result)
    return result
  } catch {
    const result = { exists: false }
    statsCache.set(filePath, result)
    return result
  }
}
export async function existsCached(filePath) {
  const { exists } = await statCached(filePath)
  return exists
}
export function clearPathCache() {
  statsCache.clear()
}
