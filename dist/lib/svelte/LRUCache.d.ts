export declare class LRUCache<T> {
  maxSize: number
  cache: Map<string, T>
  cwd: string | null
  constructor(maxSize?: number, cwd?: string)
  normalizeKey(key: string): string
  get(key: string): T | undefined
  set(key: string, value: T): void
  clear(): void
  get size(): number
}
