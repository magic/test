import { LRUCache } from '../LRUCache.ts'

export interface PackageExportResolve {
  resolvedPath: string | null
  isSvelteOnly: boolean
}

export const packageExportCache = new LRUCache<PackageExportResolve>(200, process.cwd())
