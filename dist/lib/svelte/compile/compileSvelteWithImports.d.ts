import type { CssObject } from './types.ts'
export declare const compileSvelteWithImports: (filePath: string) => Promise<{
  js: string
  css: CssObject | null
}>
