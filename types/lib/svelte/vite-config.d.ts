/** @type {Map<string, { config: any, mtime: number }>} */
export const configCache: Map<
  string,
  {
    config: any
    mtime: number
  }
>
/** @type {Map<string, AliasEntry[]>} */
export const aliasCache: Map<string, AliasEntry[]>
export function resolveAlias(importPath: string, sourceFilePath: string): Promise<string | null>
export function getProjectRoot(sourceDir: string): Promise<string>
export type AliasEntry = {
  find: string | RegExp
  replacement: string
}
//# sourceMappingURL=vite-config.d.ts.map
