export interface ResolveAliasOptions {
  includeShims?: boolean
}
export declare const resolveAlias: (
  importPath: string,
  sourceFilePath: string,
  options?: ResolveAliasOptions,
) => Promise<string | null>
