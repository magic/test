import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findConfigFile } from './findConfigFile.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'
import { aliasCache, defineCache, configCache, type AliasEntry } from './cache.ts'
import type { ViteConfig } from '../../../types.ts'
import { normalizeAlias } from './normalizeAlias.ts'

export const loadViteConfig = async (rootDir: string): Promise<ViteConfig> => {
  const cacheKey = rootDir + ':vite-full'
  const cached = configCache.get(cacheKey)
  if (cached) {
    return cached.config
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    configCache.set(cacheKey, { config: {}, mtime: 0 })
    return {}
  }

  try {
    const configUrl = pathToFileURL(configPath).href
    const mod = await import(configUrl)
    const config = (mod.default ?? mod) as ViteConfig
    const configDir = path.dirname(configPath)

    // Normalize aliases
    const aliases = normalizeAlias(config.resolve?.alias, configDir)
    aliasCache.set(rootDir + ':vite', aliases)

    // Cache define
    const define = config.define ?? {}
    defineCache.set(rootDir + ':vite-define', define)

    configCache.set(cacheKey, { config, mtime: Date.now() })
    return config
  } catch {
    configCache.set(cacheKey, { config: {}, mtime: 0 })
    return {}
  }
}

export const getViteAliases = (config: ViteConfig, configDir: string): AliasEntry[] => {
  return normalizeAlias(config.resolve?.alias, configDir)
}

export const getViteDefine = (config: ViteConfig): Record<string, unknown> => {
  return config.define ?? {}
}
