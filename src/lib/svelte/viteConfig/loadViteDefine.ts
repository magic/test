import { findConfigFile } from './findConfigFile.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'
import { defineCache } from './cache.ts'
import { loadViteConfig } from './loadViteConfig.ts'

export const loadViteDefine = async (rootDir: string): Promise<Record<string, unknown>> => {
  const cacheKey = rootDir + ':vite-define'
  const cached = defineCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  let defineConfig: Record<string, unknown> | undefined

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
