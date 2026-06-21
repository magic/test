import path from 'node:path'
import fs from '@magic/fs'
import { LRUCache } from '../LRUCache.js'
import { CWD } from '../../../constants.js'
import { getCachedCompile, recordCompile } from './persistentCache.js'
// Export LRUCache for external use
export { LRUCache }
// Re-export persistent cache functions
export { clearCache } from './persistentCache.js'
// Export cache instances for backward compatibility
export const cache = new LRUCache(100)
export const importCache = new LRUCache(100)
export const barrelCache = new Map()
export const processingBarrels = new Set()
// Promise-based deduplication maps
export const pendingBarrelCompiles = new Map()
export const pendingSvelteCompiles = new Map()
export const pendingSvelteExports = new Map()
/**
 * Centralized cache manager for Svelte compilation
 * Handles: promise dedup, memory cache, disk cache
 */
export class CacheManager {
  pendingCompiles = new Map()
  memoryCache = new Map()
  // Cache stats
  hits = 0
  misses = 0
  /**
   * Get cached result or compile with deduplication
   */
  async getOrCompile(filePath, compileFn) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    // Check promise dedup first
    const pending = this.pendingCompiles.get(absPath)
    if (pending) {
      this.hits++
      return pending
    }
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
      const data = diskCached
      this.memoryCache.set(absPath, { data, mtime: diskCached.mtime })
      return data
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
    return compilePromise
  }
  /**
   * Type guard to check if result is a Svelte compilation result
   */
  isSvelteResult(result) {
    return typeof result === 'object' && result !== null && 'js' in result
  }
  /**
   * Check disk cache for a compiled Svelte file
   */
  async checkDiskCache(filePath) {
    if (!filePath.endsWith('.svelte')) {
      return null
    }
    // Try persistent cache (hash-based)
    const cached = await getCachedCompile(filePath)
    if (cached) {
      const stats = await fs.stat(filePath)
      return { js: cached.js, css: cached.css, mtime: stats.mtimeMs }
    }
    return null
  }
  /**
   * Write compiled result to disk cache
   */
  async writeDiskCache(filePath, js) {
    // Write to persistent cache (hash-based)
    await recordCompile(filePath, js)
  }
  /**
   * Get cache stats
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) : '0.0'
    return { hits: this.hits, misses: this.misses, hitRate }
  }
  /**
   * Reset all caches
   */
  reset() {
    this.pendingCompiles.clear()
    this.memoryCache.clear()
    this.hits = 0
    this.misses = 0
  }
}
export const cacheManager = new CacheManager()
