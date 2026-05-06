import type { ViteConfig } from '../../../types.ts'
export declare const configCache: Map<
  string,
  {
    config: ViteConfig
    mtime: number
  }
>
export type AliasEntry = {
  find: string | RegExp
  replacement: string
}
export declare const aliasCache: Map<string, AliasEntry[]>
export declare const defineCache: Map<string, Record<string, unknown>>
