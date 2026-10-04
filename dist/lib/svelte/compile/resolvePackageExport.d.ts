import { type PackageExportResolveEntry } from '#src/lib/caches/cache.js'
export type PackageExportResolve = PackageExportResolveEntry
export declare const resolvePackageExport: (
  pkgSpec: string,
  sourceDir: string,
) => Promise<PackageExportResolve>
