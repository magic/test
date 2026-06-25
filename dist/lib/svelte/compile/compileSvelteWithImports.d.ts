import type { CssObject } from './types.js'
export declare const compileSvelteWithImports: (filePath: string) => Promise<{
  js: string
  css: CssObject | null
}>
