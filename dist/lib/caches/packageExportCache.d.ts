import { LRUCache } from './LRUCache.ts'
import type { PackageExportResolve } from '../svelte/compile/resolvePackageExport.ts'
export declare const packageExportCache: LRUCache<PackageExportResolve>
