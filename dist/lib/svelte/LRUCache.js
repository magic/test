import is from '@magic/types'
export class LRUCache {
  maxSize
  cache = new Map()
  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }
  get(key) {
    if (!this.cache.has(key)) {
      return undefined
    }
    const value = this.cache.get(key)
    if (is.undefined(value)) {
      return undefined
    }
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }
  clear() {
    this.cache.clear()
  }
  get size() {
    return this.cache.size
  }
}
