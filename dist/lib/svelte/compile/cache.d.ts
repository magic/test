import { LRUCache } from '../LRUCache.js'
import type { CompileCacheEntry, ImportCacheEntry, BarrelCacheEntry } from './types.js'
export declare const cache: LRUCache<CompileCacheEntry>
export declare const importCache: LRUCache<ImportCacheEntry>
export declare const barrelCache: Map<string, BarrelCacheEntry>
export declare const processingBarrels: Set<string>
export declare const fileLocks: Map<string, Promise<unknown>>
