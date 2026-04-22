import { LRUCache } from '../LRUCache.js'

export interface PackageExportResolve {
  resolvedPath: string | null
  isSvelteOnly: boolean
}

export const packageExportCache = new LRUCache<PackageExportResolve>(200, process.cwd())
