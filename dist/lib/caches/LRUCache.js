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
    if (value === undefined) {
      return undefined
    }
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }
  delete(key) {
    return this.cache.delete(key)
  }
  has(key) {
    return this.cache.has(key)
  }
  clear() {
    this.cache.clear()
  }
  get size() {
    return this.cache.size
  }
}
