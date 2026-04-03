/** @type {Map<string, { config: unknown, mtime: number }>} */
export const configCache: Map<
  string,
  {
    config: unknown
    mtime: number
  }
>
/** @type {Map<string, AliasEntry[]>} */
export const aliasCache: Map<string, AliasEntry[]>
/** @type {Map<string, Record<string, unknown>>} */
export const defineCache: Map<string, Record<string, unknown>>
export function resolveAlias(importPath: string, sourceFilePath: string): Promise<string | null>
export function resolveViteAlias(importPath: string, sourceFilePath: string): Promise<string | null>
export function getProjectRoot(sourceDir: string): Promise<string>
export function getViteDefine(sourceFilePath: string): Promise<Record<string, unknown>>
export type AliasEntry = {
  find: string | RegExp
  replacement: string
}
//# sourceMappingURL=vite-config.d.ts.map
