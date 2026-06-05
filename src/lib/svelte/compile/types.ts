import type { SourceMap } from 'magic-string'

export interface CssObject {
  code: string
  map?: SourceMap
  hasGlobal?: boolean
}

export interface CompileCacheEntry {
  js: string
  css: CssObject | null
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

export type ResolveAndCompileResult =
  | {
      filePath: string
      js: string
      url: string | null
      skipProcessing: true
      isSvelteOnlyPackage?: boolean
    }
  | { filePath: string; js: string; url: string; isSvelteOnlyPackage?: boolean }
