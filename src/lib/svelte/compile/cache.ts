import { LRUCache } from '../LRUCache.js'
import type { CompileCacheEntry, ImportCacheEntry, BarrelCacheEntry } from './types.js'

export const cache = new LRUCache<CompileCacheEntry>(100)

export const importCache = new LRUCache<ImportCacheEntry>(100)

export const barrelCache = new Map<string, BarrelCacheEntry>()

export const processingBarrels = new Set<string>()

export const fileLocks = new Map<string, Promise<unknown>>()
