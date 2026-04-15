import type { CssObject } from './types.js'
export declare const compileSvelteWithImports: (filePath: string) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
