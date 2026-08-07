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
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { aliasCache, defineCache, configCache } from './cache.js'
import { normalizeAlias } from './normalizeAlias.js'
export const loadViteConfig = async rootDir => {
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
    const mod = await import(__rewriteRelativeImportExtension(configUrl))
    const config = mod.default ?? mod
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
export const getViteAliases = (config, configDir) => {
  return normalizeAlias(config.resolve?.alias, configDir)
}
export const getViteDefine = config => {
  return config.define ?? {}
}
