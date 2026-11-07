import { LRUCache } from '../../caches/LRUCache.js'
import type { AliasEntry, ViteConfig } from '../../../types.js'
export { type AliasEntry } from '../../../types.js'
export declare const configCache: LRUCache<{
  config: ViteConfig
  mtime: number
  size: number
}>
export declare const aliasCache: LRUCache<AliasEntry[]>
export declare const defineCache: LRUCache<Record<string, unknown>>
export declare const resolvedAliasCache: LRUCache<string | null>
