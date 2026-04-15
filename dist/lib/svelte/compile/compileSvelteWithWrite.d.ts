import type { CssObject } from './types.js'
export declare const compileSvelteWithWrite: (filePath: string) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
  tmpFile: string
  importUrl: string
}>
