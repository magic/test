import is from '@magic/types'
import path from 'node:path'

import { findConfigFile } from './findConfigFile.js'

import { aliasCache, type AliasEntry } from './cache.js'
import { parseViteConfig } from './parseViteConfig.js'
import { normalizeAlias } from './normalizeAlias.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'

export const loadViteAliases = async (rootDir: string): Promise<AliasEntry[]> => {
  const cacheKey = rootDir + ':vite'
  const cached = aliasCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    aliasCache.set(cacheKey, [])
    return []
  }

  try {
    const config = await parseViteConfig(configPath)
    const configDir = path.dirname(configPath)
    const resolveConfig = config.resolve as Record<string, unknown> | undefined
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)
    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config: ${message}`)
    return []
  }
}
