import fs from '@magic/fs'

// Cache for file stats (includes existence check)
const statsCache = new Map<string, { exists: boolean; mtime?: number; size?: number }>()
const MAX_CACHE_SIZE = 1000

// Evict oldest entries when cache gets too large
const evictIfNeeded = () => {
  if (statsCache.size >= MAX_CACHE_SIZE) {
    const firstKey = statsCache.keys().next().value
    if (firstKey) {
      statsCache.delete(firstKey)
    }
  }
}

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
    evictIfNeeded()
    return result
  } catch {
    const result = { exists: false }
    statsCache.set(filePath, result)
    evictIfNeeded()
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
