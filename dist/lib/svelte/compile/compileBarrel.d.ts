export declare const compileBarrel: (
  filePath: string,
  importChain?: string[],
  knownExports?: {
    name: string
    path: string
    isDefaultReexport?: boolean
  }[],
) => Promise<{
  filePath: string
  js: string
  wrapperAbsPath: string
}>
