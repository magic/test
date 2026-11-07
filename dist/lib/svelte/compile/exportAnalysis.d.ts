import type { ExportInfo } from './types.js'
export interface ExportVisitor {
  onSvelteExport: (name: string, resolvedPath: string) => boolean
  onSvelteDefault: (defaultName: string, resolvedPath: string) => boolean
  onJsExport: (exp: ExportInfo) => boolean
}
export declare const traverseExports: (
  filePath: string,
  visitor: ExportVisitor,
  visited?: Set<string>,
) => Promise<void>
export declare const extractNamedExportsRecursive: (filePath: string) => Promise<ExportInfo[]>
export declare const findSvelteFileForExport: (
  filePath: string,
  exportName: string,
) => Promise<string | null>
export interface ExportSource {
  svelte: string | null
  js: string | null
  jsExportName: string | null
}
/**
 * Resolve a named export of a (possibly transitive) barrel to the concrete file
 * that provides it: either a `.svelte` file (component — always a default export)
 * or a `.js` file (util / re-export source). Walks `export * from` and
 * `export { x } from` chains with cycle detection.
 *
 * For a `.js` source, `jsExportName` is the name the SOURCE file exports (which
 * may differ from the barrel's export name when the barrel aliases it,
 * e.g. `export { cn as classnames } from './x.js'`). The caller re-exports as
 * `export { jsExportName as <consumerName> } from '<js>'`.
 *
 * Returns at most one of `svelte` / `js` non-null; both null when unresolvable.
 */
export declare const findExportSourceFile: (
  entryPath: string,
  exportName: string,
) => Promise<ExportSource>
export declare const extractNamedImportsFromCode: (code: string, spec: string) => string[]
/**
 * True when `filePath` (a JS module) transitively re-exports at least one
 * `.svelte` file — i.e. it is a "svelte barrel" (directly, or via `export *
 * from './sub.js'` sub-barrels). Walks the export graph with cycle detection
 * and stops at the first `.svelte` export, so it is cheap for the common case.
 */
export declare const isSvelteBarrel: (filePath: string) => Promise<boolean>
