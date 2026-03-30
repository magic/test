/**
 * Simple LRU-style cache with max size
 * @template T
 */
export class LRUCache<T> {
  /**
   * @param {number} [maxSize]
   */
  constructor(maxSize?: number)
  /** @type {number} */
  maxSize: number
  /** @type {Map<string, T>} */
  cache: Map<string, T>
  /**
   * @param {string} key
   * @returns {T | undefined}
   */
  get(key: string): T | undefined
  /**
   * @param {string} key
   * @param {T} value
   */
  set(key: string, value: T): void
  clear(): void
  /** @returns {number} */
  get size(): number
}
//# sourceMappingURL=LRUCache.d.ts.map
