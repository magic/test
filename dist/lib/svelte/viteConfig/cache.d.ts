import type { AliasEntry, ViteConfig } from '../../../types.ts'
export { type AliasEntry } from '../../../types.ts'
export declare const configCache: Map<
  string,
  {
    config: ViteConfig
    mtime: number
  }
>
export declare const aliasCache: Map<string, AliasEntry[]>
export declare const defineCache: Map<string, Record<string, unknown>>
