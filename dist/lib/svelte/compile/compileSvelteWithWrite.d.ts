import type { CssObject } from './types.js'
export declare const compileSvelteWithWrite: (
  filePath: string,
  importChain?: string[],
) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
  tmpFile: string
  importUrl: string
}>
