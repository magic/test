import type { TSESTree } from '@typescript-eslint/types'
import type { ExportInfo } from './types.ts'
export type FileInfo = {
  code: string
  ast: TSESTree.Program
  filePath: string
}
export declare const clearAstCache: () => void
declare const extractScriptFromSvelte: (source: string) => Promise<string>
declare const parseFile: (code: string, filePath: string) => Promise<FileInfo>
declare const getOriginal: (node: TSESTree.Node, code: string) => string
declare const getDeclarationNames: (decl: TSESTree.Node) => string[]
declare const extractExports: (fileInfo: FileInfo) => ExportInfo[]
declare const extractImports: (fileInfo: FileInfo) => Array<{
  type: 'static' | 'dynamic' | 'sideEffect' | 'namespace'
  source: string
  specifiers: string[]
  originalText?: string
}>
export {
  extractScriptFromSvelte,
  parseFile,
  extractExports,
  getDeclarationNames,
  extractImports,
  getOriginal,
}
