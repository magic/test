import is from '@magic/types'
import path from 'node:path'

export class LRUCache<T> {
  maxSize: number
  cache = new Map<string, T>()
  cwd: string | null = null

  constructor(maxSize = 100, cwd?: string) {
    this.maxSize = maxSize
    this.cwd = cwd || process.cwd()
  }

  normalizeKey(key: string): string {
    if (path.isAbsolute(key) && this.cwd) {
      return path.relative(this.cwd, key)
    }
    return key
  }

  get(key: string): T | undefined {
    const normalizedKey = this.normalizeKey(key)
    if (!this.cache.has(normalizedKey)) {
      return undefined
    }
    const value = this.cache.get(normalizedKey)
    if (is.undefined(value)) {
      return undefined
    }
    this.cache.delete(normalizedKey)
    this.cache.set(normalizedKey, value)
    return value
  }

  set(key: string, value: T): void {
    const normalizedKey = this.normalizeKey(key)
    if (this.cache.has(normalizedKey)) {
      this.cache.delete(normalizedKey)
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(normalizedKey, value)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}
