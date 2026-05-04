import type { CssObject } from './types.js'
export declare const compileSvelteWithWrite: (filePath: string) => Promise<{
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}>
