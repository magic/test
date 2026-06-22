import { LRUCache } from './LRUCache.ts'
import type {
  CompileCacheEntry,
  ImportCacheEntry,
  BarrelCacheEntry,
  CssObject,
} from '../../types.ts'
export { LRUCache }
export { clearCache } from './persistentCache.ts'
export interface PackageExportResolveEntry {
  resolvedPath: string | null
  isSvelteOnly: boolean
  hasSvelteReExports?: boolean
  isSvelteOnlyPackage?: boolean
}
export declare const cache: LRUCache<CompileCacheEntry>
export declare const importCache: LRUCache<ImportCacheEntry>
export declare const packageExportCache: LRUCache<PackageExportResolveEntry>
export declare const barrelCache: LRUCache<BarrelCacheEntry>
export declare const pendingPromises: Map<string, Promise<unknown>>
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
