export declare const compileBarrel: (
  filePath: string,
  importChain?: string[],
) => Promise<{
  filePath: string
  js: {
    code: string
  }
  wrapperAbsPath: string
}>
