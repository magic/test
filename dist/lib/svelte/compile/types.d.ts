export interface ExportInfo {
  name: string
  alias?: string
  source: string | null
  isType: boolean
  isDefault: boolean
  isBatch: boolean
  originalText?: string
}
