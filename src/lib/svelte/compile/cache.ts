import { LRUCache } from '../LRUCache.ts'
import type { CompileCacheEntry, ImportCacheEntry, BarrelCacheEntry, CssObject } from './types.ts'

export const cache = new LRUCache<CompileCacheEntry>(100)

export const importCache = new LRUCache<ImportCacheEntry>(100)

export const barrelCache = new Map<string, BarrelCacheEntry>()

export const processingBarrels = new Set<string>()

// Promise-based deduplication to prevent thundering herd
// Maps filePath -> Promise that resolves to the result
// Barrel result type matches what's returned from compileBarrel
export const pendingBarrelCompiles = new Map<
  string,
  Promise<{ filePath: string; js: string; wrapperAbsPath: string }>
>()

export const pendingSvelteCompiles = new Map<
  string,
  Promise<{ js: string; css: CssObject | null }>
>()

export const pendingSvelteExports = new Map<
  string,
  Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]>
>()
