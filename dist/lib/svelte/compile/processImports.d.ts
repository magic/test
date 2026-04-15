export declare const processImports: (
  code: string,
  sourceFilePath: string,
  importChain?: string[],
) => Promise<{
  code: string
}>
