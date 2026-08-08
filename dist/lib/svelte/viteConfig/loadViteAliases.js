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
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { findConfigFile } from './findConfigFile.js'
import { aliasCache } from './cache.js'
import { normalizeAlias } from './normalizeAlias.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
// Track loading state to prevent circular dependencies
const loadingViteConfig = new Set()
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
  // Prevent circular imports
  if (loadingViteConfig.has(configPath)) {
    return []
  }
  loadingViteConfig.add(configPath)
  try {
    const configUrl = pathToFileURL(configPath).href
    const config =
      (await import(__rewriteRelativeImportExtension(configUrl))).default ??
      (await import(__rewriteRelativeImportExtension(configUrl)))
    const configDir = path.dirname(configPath)
    const resolveConfig = config.resolve
    const aliases = normalizeAlias(resolveConfig?.alias, configDir)
    // Always add $app alias pointing to mocks (the sveltekit plugin sets this
    // in its configure hook which we can't access in test mode)
    const mocksDir = path.join(rootDir, '__app_mocks__')
    if (fs.existsSync(mocksDir)) {
      const hasAppAlias = aliases.some(a => a.find === '$app')
      if (!hasAppAlias) {
        aliases.unshift({ find: '$app', replacement: mocksDir })
      }
    }
    aliasCache.set(cacheKey, aliases)
    return aliases
  } catch {
    return []
  } finally {
    loadingViteConfig.delete(configPath)
  }
}
