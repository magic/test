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
export declare const extractNamedImportsFromCode: (code: string, spec: string) => string[]
