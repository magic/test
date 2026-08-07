import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { defineCache } from './cache.js'
import { loadViteConfig } from './loadViteConfig.js'
export const loadViteDefine = async rootDir => {
  const cacheKey = rootDir + ':vite-define'
  const cached = defineCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  let defineConfig
  if (configPath) {
    try {
      const config = await loadViteConfig(rootDir)
      defineConfig = config.define
    } catch {
      // config not available or parse error - return empty
    }
  }
  defineCache.set(cacheKey, defineConfig || {})
  return defineConfig || {}
}
