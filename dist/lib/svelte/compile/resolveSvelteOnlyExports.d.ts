export declare const writeTempFile: (filePath: string, code: string) => Promise<string>
export declare const compileSvelteOnlyExport: (
  sveltePath: string,
  sourceDir: string,
  exportNames?: string[],
) => Promise<string>
export declare const resolveSvelteOnlyExports: (code: string, sourceDir: string) => Promise<string>
