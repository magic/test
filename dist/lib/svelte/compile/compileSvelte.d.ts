import type { CssObject } from './types.js'
export declare const compileSvelte: (filePath: string) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
