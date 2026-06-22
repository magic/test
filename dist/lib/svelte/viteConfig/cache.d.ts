import { LRUCache } from '../../caches/LRUCache.ts'
import type { AliasEntry, ViteConfig } from '../../../types.ts'
export { type AliasEntry } from '../../../types.ts'
export declare const configCache: LRUCache<{
  config: ViteConfig
  mtime: number
}>
export declare const aliasCache: LRUCache<AliasEntry[]>
export declare const defineCache: LRUCache<Record<string, unknown>>
export declare const resolvedAliasCache: LRUCache<string | null>
