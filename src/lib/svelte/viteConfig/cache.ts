import { LRUCache } from '../../caches/LRUCache.js'
import type { AliasEntry, ViteConfig } from '../../../types.js'

export { type AliasEntry } from '../../../types.js'

export const configCache = new LRUCache<{ config: ViteConfig; mtime: number; size: number }>(200)
export const aliasCache = new LRUCache<AliasEntry[]>(200)
export const defineCache = new LRUCache<Record<string, unknown>>(200)
export const resolvedAliasCache = new LRUCache<string | null>(500)
