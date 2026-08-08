import fs from '@magic/fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findConfigFile } from './findConfigFile.ts'

import { aliasCache, type AliasEntry } from './cache.ts'
import { normalizeAlias } from './normalizeAlias.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'

// Track loading state to prevent circular dependencies
const loadingViteConfig = new Set<string>()

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

  // Prevent circular imports
  if (loadingViteConfig.has(configPath)) {
    return []
  }
  loadingViteConfig.add(configPath)

  try {
    const configUrl = pathToFileURL(configPath).href
    const config = (await import(configUrl)).default ?? (await import(configUrl))
    const configDir = path.dirname(configPath)
    const resolveConfig = config.resolve as Record<string, unknown> | undefined
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)

    // Always add $app alias pointing to mocks (the sveltekit plugin sets this
    // in its configure hook which we can't access in test mode)
    const mocksDir = path.join(rootDir, '__app_mocks__')
    if (fs.existsSync(mocksDir)) {
      const hasAppAlias = aliases.some(a => a.find === '$app')
      if (!hasAppAlias) {
        aliases.unshift({ find: '$app', replacement: mocksDir })
      }
    }

    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch {
    return []
  } finally {
    loadingViteConfig.delete(configPath)
  }
}
