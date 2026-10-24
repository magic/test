/* ---------------------------------------------------------------------------
 * Svelte compilation types.
 * -------------------------------------------------------------------------- */

/**
 * CSS output from Svelte compilation.
 */
export interface CssObject {
  code: string
  map?: unknown
  hasGlobal?: boolean
}

/**
 * Result of resolving and compiling an import.
 */
export type ResolveAndCompileResult =
  | {
      filePath: string
      js: string
      url: string | null
      skipProcessing: true
      isSvelteOnlyPackage?: boolean
    }
  | { filePath: string; js: string; url: string; isSvelteOnlyPackage?: boolean }
  | {
      filePath: string
      js: string
      url: null
      /**
       * The import has no Node.js equivalent (side-effect asset imports such
       * as `import './app.css'`) — drop the statement from the compiled code.
       */
      removeImport: true
    }
import type { SourceMap } from 'magic-string'

export interface CssObjectInternal extends CssObject {
  map?: SourceMap
}

export interface CompileCacheEntry {
  js: string
  css: CssObjectInternal | null
  mtime: number
}

export interface ImportCacheEntry {
  js: string
  absPath: string
  mtime: number
}

export interface BarrelCacheEntry {
  exports: { name: string; path: string; isDefaultReexport?: boolean }[]
  wrapperAbsPath: string
}

export interface ExportInfo {
  name: string
  alias?: string
  source: string | null
  isType: boolean
  isDefault: boolean
  isBatch: boolean
  originalText?: string
}
