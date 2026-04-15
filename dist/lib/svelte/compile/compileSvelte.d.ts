import type { CssObject } from './types.ts'
export declare const compileSvelte: (filePath: string) => Promise<{
  js: {
    code: string
  }
  css: CssObject | null
}>
