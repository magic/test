import is from '@magic/types'
import path from 'node:path'
export class LRUCache {
  maxSize
  cache = new Map()
  cwd = null
  constructor(maxSize = 100, cwd) {
    this.maxSize = maxSize
    this.cwd = cwd || process.cwd()
  }
  normalizeKey(key) {
    if (path.isAbsolute(key) && this.cwd) {
      return path.relative(this.cwd, key)
    }
    return key
  }
  get(key) {
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
  set(key, value) {
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
  clear() {
    this.cache.clear()
  }
  get size() {
    return this.cache.size
  }
}
