import is from '@magic/types'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { defineCache } from './cache.js'
import { parseViteConfig } from './parseViteConfig.js'
/**
 * Get vite define variables for a source file
 * Times out after 3 seconds to avoid hanging in workers
 */
export const getViteDefine = async () => {
  const rootDir = process.cwd()
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
    const defineConfig = config.define
    defineCache.set(cacheKey, defineConfig || {})
    return defineConfig || {}
  } catch (e) {
    const message = is.error(e) ? e.message : String(e)
    console.warn(`[svelte-alias] Failed to parse vite.config define: ${message}`)
    return {}
  }
}
