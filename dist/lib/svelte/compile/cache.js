import { LRUCache } from '../LRUCache.js'
export const cache = new LRUCache(100)
export const importCache = new LRUCache(100)
export const barrelCache = new Map()
export const processingBarrels = new Set()
// Promise-based deduplication to prevent thundering herd
// Maps filePath -> Promise that resolves to the result
// Barrel result type matches what's returned from compileBarrel
export const pendingBarrelCompiles = new Map()
export const pendingSvelteCompiles = new Map()
export const pendingSvelteExports = new Map()
