import { LRUCache } from './LRUCache.ts'
import type { PackageExportResolve } from '../svelte/compile/resolvePackageExport.ts'

export const packageExportCache = new LRUCache<PackageExportResolve>(200)
