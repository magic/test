import type { SourceMap } from 'magic-string'
import type { CssObject } from '../../../types.ts'
export type { CssObject, ResolveAndCompileResult } from '../../../types.ts'
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
  exports: {
    name: string
    path: string
    isDefaultReexport?: boolean
  }[]
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
