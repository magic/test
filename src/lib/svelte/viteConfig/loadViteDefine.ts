import is from '@magic/types'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'

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

  let defineConfig: Record<string, unknown> | undefined

  if (configPath) {
    try {
      const config = await parseViteConfig(configPath)
      defineConfig = config.define as Record<string, unknown> | undefined
    } catch (e) {
      const message = is.error(e) ? e.message : String(e)
      console.warn(`[svelte-alias] Failed to parse vite.config define: ${message}`)
    }
  }

  const configPkgPath = path.join(
    rootDir,
    'node_modules/@systemkollektiv/config/dist/viteDefine.js',
  )
  if (await fs.exists(configPkgPath)) {
    try {
      const mod = await import(pathToFileURL(configPkgPath).href)
      const pkgDefine = mod.define as Record<string, unknown>
      if (pkgDefine) {
        defineConfig = { ...pkgDefine, ...defineConfig }
      }
    } catch (e) {
      console.warn('[svelte-alias] Failed to load @systemkollektiv/config define:', e)
    }
  }

  defineCache.set(cacheKey, defineConfig || {})
  return defineConfig || {}
}
