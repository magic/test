var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import is from '@magic/types'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { defineCache } from './cache.js'
import { parseViteConfig } from './parseViteConfig.js'
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
      const config = await parseViteConfig(configPath)
      defineConfig = config.define
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
      const mod = await import(__rewriteRelativeImportExtension(pathToFileURL(configPkgPath).href))
      const pkgDefine = mod.define
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
