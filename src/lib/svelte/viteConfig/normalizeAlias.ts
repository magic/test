import is from '@magic/types'

import { normalizeSingleAlias } from './normalizeSingleAlias.ts'

import type { AliasEntry } from './cache.ts'

export const normalizeAlias = (alias: unknown, configDir: string): AliasEntry[] => {
  if (is.array(alias)) {
    return alias.map(a => normalizeSingleAlias(a, configDir))
  }

  if (is.object(alias)) {
    return Object.entries(alias as Record<string, unknown>).map(([find, replacement]) =>
      normalizeSingleAlias({ find, replacement }, configDir),
    )
  }

  return []
}
