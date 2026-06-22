import { LRUCache } from '../../caches/LRUCache.ts'
import type { AliasEntry, ViteConfig } from '../../../types.ts'

export { type AliasEntry } from '../../../types.ts'

export const configCache = new LRUCache<{ config: ViteConfig; mtime: number }>(200)
export const aliasCache = new LRUCache<AliasEntry[]>(200)
export const defineCache = new LRUCache<Record<string, unknown>>(200)
export const resolvedAliasCache = new LRUCache<string | null>(500)
