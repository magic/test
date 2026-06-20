export type BarrelResult = {
  filePath: string
  js: string
  wrapperAbsPath: string
}
export declare const barrelWrapperCache: Map<string, string>
export declare const compileBarrel: (
  filePath: string,
  importChain?: string[],
) => Promise<BarrelResult>
