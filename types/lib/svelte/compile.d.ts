export function compileSvelte(filePath: string): Promise<{
  js: any
  css: any
}>
export function compileSvelteWithImports(filePath: string): Promise<{
  js: {
    code: string
  }
  css: any
}>
export function compileSvelteWithWrite(filePath: string): Promise<{
  js: {
    code: string
  }
  css: any
  tmpFile: string
  importUrl: string
}>
//# sourceMappingURL=compile.d.ts.map
