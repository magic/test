export interface PackageExportResolve {
  resolvedPath: string | null
  isSvelteOnly: boolean
  hasSvelteReExports?: boolean
  isSvelteOnlyPackage?: boolean
}
export declare const resolvePackageExport: (
  pkgSpec: string,
  sourceDir: string,
) => Promise<PackageExportResolve>
