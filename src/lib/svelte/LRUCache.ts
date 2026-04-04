import is from '@magic/types'

export class LRUCache<T> {
  maxSize: number
  cache = new Map<string, T>()

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
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

  set(key: string, value: T): void {
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

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}
