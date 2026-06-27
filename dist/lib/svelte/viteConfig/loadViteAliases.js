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
import { aliasCache } from './cache.js'
import { normalizeAlias } from './normalizeAlias.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
export const loadViteAliases = async rootDir => {
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
  try {
    const configUrl = pathToFileURL(configPath).href
    const config =
      (await import(__rewriteRelativeImportExtension(configUrl))).default ??
      (await import(__rewriteRelativeImportExtension(configUrl)))
    const configDir = path.dirname(configPath)
    const resolveConfig = config.resolve
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)
    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch {
    return []
  }
}
