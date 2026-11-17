import type { CssObject } from '../../../types.js'
type CompileWithWriteResult = {
  js: string
  css: CssObject | null
  tmpFile: string
  importUrl: string
}
export declare const compileSvelteWithWrite: (filePath: string) => Promise<CompileWithWriteResult>
export {}
