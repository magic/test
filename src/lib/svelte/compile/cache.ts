import path from 'node:path'

import fs from '@magic/fs'
import { LRUCache } from '../LRUCache.ts'

import { TMP_DIR, CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'

// Legacy export for backward compatibility (deprecated, use CacheManager)
export { LRUCache }

/**
 * Unified pending promises map
 * All async operations go through here for deduplication
 */
export const pendingPromises = new Map<string, Promise<unknown>>()

/**
 * Clear pending promises map (for test cleanup)
 */
export const clearPendingPromises = () => {
  pendingPromises.clear()
}

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
  private memoryCache = new Map<string, CacheEntry<T>>()

  // Cache stats
  hits = 0
  misses = 0

  /**
   * Get cached result or compile with deduplication
   */
  async getOrCompile(filePath: string, compileFn: () => Promise<T>): Promise<T> {
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)

    // Check memory cache
    const cached = this.memoryCache.get(absPath)
    if (cached) {
      try {
        const stats = await fs.stat(absPath)
        if (stats.mtimeMs === cached.mtime) {
          this.hits++
          return cached.data
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
      return data
    }

    // Need to compile
    this.misses++

    // Create promise BEFORE starting work to prevent concurrent duplicates
    const compilePromise = compileFn().then(async result => {
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
    })

    return compilePromise
  }

  /**
   * Type guard to check if result is a Svelte compilation result
   */
  private isSvelteResult(result: unknown): result is { js: string; css: CssObject | null } {
    return typeof result === 'object' && result !== null && 'js' in result
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

    const relPath = path.relative(CWD, filePath)
    const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(CWD, tmpFile)

    try {
      const sourceStats = await fs.stat(filePath)
      const compiledStats = await fs.stat(tmpFileAbs)
      if (compiledStats.mtimeMs >= sourceStats.mtimeMs) {
        const js = await fs.readFile(tmpFileAbs, 'utf-8')
        return { js, css: null, mtime: sourceStats.mtimeMs }
      }
    } catch {
      // File doesn't exist or stats failed
    }

    return null
  }

  /**
   * Write compiled result to disk cache
   */
  private async writeDiskCache(filePath: string, js: string): Promise<void> {
    const relPath = path.relative(CWD, filePath)
    const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(CWD, tmpFile)

    try {
      await fs.mkdirp(path.dirname(tmpFileAbs))
      await fs.writeFile(tmpFileAbs, js)
    } catch {
      // Ignore disk cache errors
    }
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
    this.memoryCache.clear()
    this.hits = 0
    this.misses = 0
  }
}

// Global cache manager instance with specific result type
export type SvelteCompileResult = {
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}
export const cacheManager = new CacheManager<SvelteCompileResult>()
