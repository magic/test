import { LRUCache } from './LRUCache.ts'
import type {
  CompileCacheEntry,
  ImportCacheEntry,
  BarrelCacheEntry,
  CssObject,
} from '../../types.ts'
export { LRUCache }
export { clearCache } from './persistentCache.ts'
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
/**
 * Centralized cache manager for Svelte compilation
 * Handles: promise dedup, memory cache, disk cache
 */
export declare class CacheManager<T> {
  private pendingCompiles
  private memoryCache
  hits: number
  misses: number
  /**
   * Get cached result or compile with deduplication
   * Returns result with cache status attached
   */
  getOrCompile(filePath: string, compileFn: () => Promise<T>): Promise<CachedResult<T>>
  /**
   * Type guard to check if result is a Svelte compilation result
   */
  private isSvelteResult
  /**
   * Check disk cache for a compiled Svelte file
   */
  private checkDiskCache
  /**
   * Write compiled result to disk cache
   */
  private writeDiskCache
  /**
   * Get cache stats
   */
  getStats(): {
    hits: number
    misses: number
    hitRate: string
  }
  /**
   * Reset all caches
   */
  reset(): void
}
export type CacheStatus = {
  cached: boolean
  source: 'memory' | 'disk' | 'promise' | null
}
export type CachedResult<T> = T & {
  cacheStatus?: CacheStatus
}
export type SvelteCompileResult = {
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}
export declare const cacheManager: CacheManager<SvelteCompileResult>
