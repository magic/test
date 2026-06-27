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
import { pathToFileURL } from 'node:url'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { defineCache } from './cache.js'
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
      const configUrl = pathToFileURL(configPath).href
      const config =
        (await import(__rewriteRelativeImportExtension(configUrl))).default ??
        (await import(__rewriteRelativeImportExtension(configUrl)))
      defineConfig = config.define
    } catch {
      // config not available or parse error - return empty
    }
  }
  defineCache.set(cacheKey, defineConfig || {})
  return defineConfig || {}
}
