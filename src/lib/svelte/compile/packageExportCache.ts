import { LRUCache } from '../LRUCache.ts'
import type { PackageExportResolve } from './resolvePackageExport.ts'

export { type PackageExportResolve } from './resolvePackageExport.ts'

export const packageExportCache = new LRUCache<PackageExportResolve>(200)
