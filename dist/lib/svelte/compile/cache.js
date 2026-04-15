import { LRUCache } from '../LRUCache.js'
export const cache = new LRUCache(100)
export const importCache = new LRUCache(100)
export const barrelCache = new Map()
export const processingBarrels = new Set()
export const fileLocks = new Map()
