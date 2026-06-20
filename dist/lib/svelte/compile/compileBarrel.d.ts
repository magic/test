export declare const compileBarrel: (
  filePath: string,
  importChain?: string[],
) => Promise<{
  filePath: string
  js: string
  wrapperAbsPath: string
}>
