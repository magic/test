import { LRUCache } from '../../caches/LRUCache.js'
export const configCache = new LRUCache(200)
export const aliasCache = new LRUCache(200)
export const defineCache = new LRUCache(200)
export const resolvedAliasCache = new LRUCache(500)
