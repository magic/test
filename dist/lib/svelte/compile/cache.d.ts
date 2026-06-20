import { LRUCache } from '../LRUCache.ts'
import type { CssObject } from './types.ts'
export { LRUCache }
/**
 * Unified pending promises map
 * All async operations go through here for deduplication
 */
export declare const pendingPromises: Map<string, Promise<unknown>>
/**
 * Clear pending promises map (for test cleanup)
 */
export declare const clearPendingPromises: () => void
/**
 * Centralized cache manager for Svelte compilation
 * Handles: promise dedup, memory cache, disk cache
 */
export declare class CacheManager<T> {
  private memoryCache
  hits: number
  misses: number
  /**
   * Get cached result or compile with deduplication
   */
  getOrCompile(filePath: string, compileFn: () => Promise<T>): Promise<T>
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
export type SvelteCompileResult = {
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}
export declare const cacheManager: CacheManager<SvelteCompileResult>
