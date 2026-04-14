import type { ViteConfig } from '../../../types.ts'

export const configCache = new Map<string, { config: ViteConfig; mtime: number }>()

export type AliasEntry = {
  find: string | RegExp
  replacement: string
}

export const aliasCache = new Map<string, AliasEntry[]>()

export const defineCache = new Map<string, Record<string, unknown>>()
