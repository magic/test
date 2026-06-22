import { type PackageExportResolveEntry } from '../../caches/cache.ts'
export type PackageExportResolve = PackageExportResolveEntry
export declare const resolvePackageExport: (
  pkgSpec: string,
  sourceDir: string,
) => Promise<PackageExportResolve>
