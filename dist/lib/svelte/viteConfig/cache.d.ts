import { LRUCache } from '#src/lib/caches/LRUCache.js'
import type { AliasEntry, ViteConfig } from '#src/types.js'
export { type AliasEntry } from '#src/types.js'
export declare const configCache: LRUCache<{
  config: ViteConfig
  mtime: number
}>
export declare const aliasCache: LRUCache<AliasEntry[]>
export declare const defineCache: LRUCache<Record<string, unknown>>
export declare const resolvedAliasCache: LRUCache<string | null>
