import type { SourceMap } from 'magic-string'

export interface CssObject {
  code: string
  map?: SourceMap
  hasGlobal?: boolean
}

export interface CompileCacheEntry {
  js: { code: string }
  css: CssObject | null
  mtime: number
}

export interface ImportCacheEntry {
  code: string
  absPath: string
  mtime: number
}

export interface BarrelCacheEntry {
  exports: { name: string; path: string }[]
  wrapperAbsPath: string
}

export type ResolveAndCompileResult =
  | { filePath: string; js: { code: string }; url: string | null; skipProcessing: true }
  | { filePath: string; js: { code: string }; url: string }
