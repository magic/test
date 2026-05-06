import is from '@magic/types'

import { findConfigFile } from './findConfigFile.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'
import { defineCache } from './cache.ts'
import { parseViteConfig } from './parseViteConfig.ts'

export const loadViteDefine = async (rootDir: string): Promise<Record<string, unknown>> => {
  const cacheKey = rootDir + ':vite-define'
  const cached = defineCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (!configPath) {
    defineCache.set(cacheKey, {})
    return {}
  }

  try {
    const config = await parseViteConfig(configPath)
    const defineConfig = config.define as Record<string, unknown> | undefined
    defineCache.set(cacheKey, defineConfig || {})
    return defineConfig || {}
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config define: ${message}`)
    return {}
  }
}
