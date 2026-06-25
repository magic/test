import type { TSESTree } from '@typescript-eslint/types'
import type { ExportInfo } from './types.ts'
export type FileInfo = {
  code: string
  ast: TSESTree.Program
  filePath: string
  hasRunes?: boolean
  isCompiled?: boolean
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
export type SimpleImport = {
  specifiers: string
  source: string
  originalText: string
  type: 'static' | 'namespace' | 'sideEffect'
  start: number
  end: number
  localNames: string[]
}
/**
 * Synchronously extract imports from code string.
 * Used by processImports for fast, regex-free import extraction.
 */
export declare const extractImportsSync: (code: string) => SimpleImport[]
export {
  extractScriptFromSvelte,
  parseFile,
  extractExports,
  getDeclarationNames,
  extractImports,
  getOriginal,
}
/**
 * Check if code contains Svelte 5 runes using AST parsing.
 * Returns false for already-compiled output (which also has rune calls).
 * Uses cached analysis for efficiency.
 */
export declare const hasSvelteRunes: (code: string) => boolean
/**
 * Check if code is compiled Svelte output (has import * as $ from 'svelte/internal/')
 * Uses cached analysis for efficiency.
 */
export declare const isSvelteCompiled: (code: string) => boolean
export type SvelteReexportInfo = {
  source: string
  originalText: string
}
/**
 * Check if code re-exports from .svelte files.
 * Replaces: SVELTE_REEXPORT_REGEX and SVELTE_DEFAULT_REEXPORT_REGEX
 */
export declare const getSvelteReexports: (code: string) => SvelteReexportInfo[]
/**
 * Check if code has Svelte re-exports.
 * Replaces: SVELTE_REEXPORT_REGEX.test(content) || SVELTE_DEFAULT_REEXPORT_REGEX.test(content)
 */
export declare const hasSvelteReexports: (code: string) => boolean
/**
 * Get all export * from targets.
 * Replaces: EXPORT_STAR_REGEX
 */
export declare const getExportStarTargets: (code: string) => string[]
/**
 * Check if code has export * from statements.
 * Replaces: EXPORT_STAR_REGEX.test(content)
 */
export declare const hasExportStar: (code: string) => boolean
/**
 * Get all export { x } from targets (named re-exports).
 * Replaces: EXPORT_NAMED_REGEX
 */
export declare const getExportNamedTargets: (code: string) => string[]
