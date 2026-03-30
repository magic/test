export function compileSvelte(filePath: string): Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
export function compileSvelteWithImports(filePath: string): Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
export function compileSvelteWithWrite(filePath: string): Promise<{
  js: {
    code: string
  }
  css: CssObject | null
  tmpFile: string
  importUrl: string
}>
export type CssObject = {
  code: string
  map: import('magic-string').SourceMap
  hasGlobal: boolean
}
export type CompileCacheEntry = {
  js: {
    code: string
  }
  css: CssObject | null
  mtime: number
}
export type ImportCacheEntry = {
  code: string
  url: string
  mtime: number
}
//# sourceMappingURL=compile.d.ts.map
