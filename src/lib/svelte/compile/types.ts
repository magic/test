// Re-export from main types
export type {
  CssObject,
  ResolveAndCompileResult,
  CompileCacheEntry,
  ImportCacheEntry,
  BarrelCacheEntry,
} from '../../../types.ts'

// ExportInfo is specific to this module
export interface ExportInfo {
  name: string
  alias?: string
  source: string | null
  isType: boolean
  isDefault: boolean
  isBatch: boolean
  originalText?: string
}
