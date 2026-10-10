export { writeTempFile } from './tempFiles.js'
export declare const compileSvelteOnlyExport: (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
) => Promise<string>
export declare const resolveSvelteOnlyExports: (code: string, sourceDir: string) => Promise<string>
