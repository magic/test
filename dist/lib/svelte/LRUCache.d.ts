export declare class LRUCache<T> {
  maxSize: number
  cache: Map<string, T>
  constructor(maxSize?: number)
  get(key: string): T | undefined
  set(key: string, value: T): void
  clear(): void
  get size(): number
}
