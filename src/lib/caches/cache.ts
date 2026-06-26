import path from 'node:path'

import fs from '@magic/fs'
import { LRUCache } from './LRUCache.ts'

import { CWD } from '../../constants.ts'
import type {
  CompileCacheEntry,
  ImportCacheEntry,
  BarrelCacheEntry,
  CssObject,
} from '../../types.ts'
import { getCachedCompile, recordCompile } from './persistentCache.ts'
import is from '@magic/types'

// Export LRUCache for external use
export { LRUCache }

// Re-export persistent cache functions
export { clearCache } from './persistentCache.ts'

// Shared cache entry type for package exports
export interface PackageExportResolveEntry {
  resolvedPath: string | null
  isSvelteOnly: boolean
  hasSvelteReExports?: boolean
  isSvelteOnlyPackage?: boolean
}

// Unified LRU caches
export const cache = new LRUCache<CompileCacheEntry>(100)
export const importCache = new LRUCache<ImportCacheEntry>(100)
export const packageExportCache = new LRUCache<PackageExportResolveEntry>(200)
export const barrelCache = new LRUCache<BarrelCacheEntry>(100)

// Unified promise deduplication map
// Keys prefixed: 'barrel:', 'svelte:', 'exports:', 'pkg:', 'resolve:'
export const pendingPromises = new Map<string, Promise<unknown>>()

/**
 * Generic cache entry type
 */
interface CacheEntry<T> {
  data: T
  mtime: number
}

/**
 * Centralized cache manager for Svelte compilation
 * Handles: promise dedup, memory cache, disk cache
 */
export class CacheManager<T> {
  private pendingCompiles = new Map<string, Promise<T>>()
  private memoryCache = new Map<string, CacheEntry<T>>()

  // Cache stats
  hits = 0
  misses = 0

  /**
   * Get cached result or compile with deduplication
   * Returns result with cache status attached
   */
  async getOrCompile(filePath: string, compileFn: () => Promise<T>): Promise<CachedResult<T>> {
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)

    // Check promise dedup first
    const pending = this.pendingCompiles.get(absPath)
    if (pending) {
      this.hits++
      const result = await pending
      return { ...result, cacheStatus: { cached: true, source: 'promise' } }
    }

    // Check memory cache
    const cached = this.memoryCache.get(absPath)
    if (cached) {
      try {
        const stats = await fs.stat(absPath)
        if (stats.mtimeMs === cached.mtime) {
          this.hits++
          return { ...cached.data, cacheStatus: { cached: true, source: 'memory' } }
        }
      } catch {
        // File might not exist
      }
    }

    // Check disk cache (only for Svelte files with basic result type)
    const diskCached = await this.checkDiskCache(absPath)
    if (diskCached) {
      this.hits++
      const data = diskCached as T
      this.memoryCache.set(absPath, { data, mtime: diskCached.mtime })
      return { ...data, cacheStatus: { cached: true, source: 'disk' } }
    }

    // Need to compile
    this.misses++

    // Create promise BEFORE starting work to prevent concurrent duplicates
    const compilePromise = (async () => {
      try {
        const result = await compileFn()

        // Store in memory cache
        try {
          const stats = await fs.stat(absPath)
          this.memoryCache.set(absPath, { data: result, mtime: stats.mtimeMs })
        } catch {
          // Ignore
        }

        // Write to disk cache if it's the right type
        if (this.isSvelteResult(result)) {
          await this.writeDiskCache(absPath, result.js)
        }

        return result
      } finally {
        this.pendingCompiles.delete(absPath)
      }
    })()

    this.pendingCompiles.set(absPath, compilePromise)
    const result = await compilePromise
    return { ...result, cacheStatus: { cached: false, source: null } }
  }

  /**
   * Type guard to check if result is a Svelte compilation result
   */
  private isSvelteResult(result: unknown): result is { js: string; css: CssObject | null } {
    return is.objectNative(result) && 'js' in result
  }

  /**
   * Check disk cache for a compiled Svelte file
   */
  private async checkDiskCache(
    filePath: string,
  ): Promise<{ js: string; css: CssObject | null; mtime: number } | null> {
    if (!filePath.endsWith('.svelte')) {
      return null
    }

    // Try persistent cache (hash-based)
    const cached = await getCachedCompile(filePath)
    if (cached) {
      const stats = await fs.stat(filePath)
      return { js: cached.js, css: cached.css as CssObject | null, mtime: stats.mtimeMs }
    }

    return null
  }

  /**
   * Write compiled result to disk cache
   */
  private async writeDiskCache(filePath: string, js: string): Promise<void> {
    // Write to persistent cache (hash-based)
    await recordCompile(filePath, js)
  }

  /**
   * Get cache stats
   */
  getStats(): { hits: number; misses: number; hitRate: string } {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) : '0.0'
    return { hits: this.hits, misses: this.misses, hitRate }
  }

  /**
   * Reset all caches
   */
  reset(): void {
    this.pendingCompiles.clear()
    this.memoryCache.clear()
    this.hits = 0
    this.misses = 0
  }
}

// Cache status for tracing
export type CacheStatus = {
  cached: boolean
  source: 'memory' | 'disk' | 'promise' | null
}

// Result wrapper that includes cache status
export type CachedResult<T> = T & { cacheStatus?: CacheStatus }

// Global cache manager instance with specific result type
export type SvelteCompileResult = {
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}
export const cacheManager = new CacheManager<SvelteCompileResult>()
