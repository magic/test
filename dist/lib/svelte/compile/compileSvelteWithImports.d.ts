import type { CssObject } from './types.js'
export declare const compileSvelteWithImports: (
  filePath: string,
  importChain?: string[],
) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
