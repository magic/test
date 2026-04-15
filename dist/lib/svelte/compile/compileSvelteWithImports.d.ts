import type { CssObject } from './types.ts'
export declare const compileSvelteWithImports: (filePath: string) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
