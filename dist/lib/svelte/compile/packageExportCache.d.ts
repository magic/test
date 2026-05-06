import { LRUCache } from '../LRUCache.ts'
export interface PackageExportResolve {
  resolvedPath: string | null
  isSvelteOnly: boolean
}
export declare const packageExportCache: LRUCache<PackageExportResolve>
