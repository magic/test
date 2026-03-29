import is from '@magic/types'

/**
 * Simple LRU-style cache with max size
 * @template T
 */
export class LRUCache {
  /** @type {number} */
  maxSize
  /** @type {Map<string, T>} */
  cache = new Map()

  /**
   * @param {number} [maxSize]
   */
  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  /**
   * @param {string} key
   * @returns {T | undefined}
   */
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

  /**
   * @param {string} key
   * @param {T} value
   */
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

  /** @returns {number} */
  get size() {
    return this.cache.size
  }
}
