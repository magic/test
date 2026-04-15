import type { ResolveAndCompileResult } from './types.ts'
export declare const resolveAndCompileImport: (
  importPath: string,
  sourceDir: string,
  sourceFilePath: string,
  importChain?: string[],
) => Promise<ResolveAndCompileResult>
