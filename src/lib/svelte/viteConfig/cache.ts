export type AliasEntry = {
  find: string | RegExp
  replacement: string
}

export const configCache = new Map<string, { config: unknown; mtime: number }>()

export const aliasCache = new Map<string, AliasEntry[]>()

export const defineCache = new Map<string, Record<string, unknown>>()
