import { LRUCache } from './LRUCache.ts'
import fs from '@magic/fs'

// LRU cache for file stats (includes existence check)
const statsCache = new LRUCache<{ exists: boolean; mtime?: number; size?: number }>(1000)

export async function statCached(
  filePath: string,
): Promise<{ exists: boolean; mtime?: number; size?: number }> {
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

export async function existsCached(filePath: string): Promise<boolean> {
  const { exists } = await statCached(filePath)
  return exists
}

export function clearPathCache(): void {
  statsCache.clear()
}
