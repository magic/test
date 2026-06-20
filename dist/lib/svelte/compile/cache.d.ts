import { LRUCache } from '../LRUCache.ts'
import type { CompileCacheEntry, ImportCacheEntry, BarrelCacheEntry, CssObject } from './types.ts'
export declare const cache: LRUCache<CompileCacheEntry>
export declare const importCache: LRUCache<ImportCacheEntry>
export declare const barrelCache: Map<string, BarrelCacheEntry>
export declare const processingBarrels: Set<string>
export declare const pendingBarrelCompiles: Map<
  string,
  Promise<{
    filePath: string
    js: string
    wrapperAbsPath: string
  }>
>
export declare const pendingSvelteCompiles: Map<
  string,
  Promise<{
    js: string
    css: CssObject | null
  }>
>
export declare const pendingSvelteExports: Map<
  string,
  Promise<
    {
      name: string
      path: string
      isDefaultReexport?: boolean
    }[]
  >
>
