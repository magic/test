import type { CssObject } from './types.js'
export interface CompileSvelteReturn {
  js: string
  css: CssObject | null
}
export declare const compileSvelte: (filePath: string) => Promise<CompileSvelteReturn>
