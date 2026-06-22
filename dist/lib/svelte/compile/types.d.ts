export type {
  CssObject,
  ResolveAndCompileResult,
  CompileCacheEntry,
  ImportCacheEntry,
  BarrelCacheEntry,
} from '../../../types.ts'
export interface ExportInfo {
  name: string
  alias?: string
  source: string | null
  isType: boolean
  isDefault: boolean
  isBatch: boolean
  originalText?: string
}
