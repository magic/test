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
import { findProjectRoot } from './findProjectRoot.js'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { LRUCache } from '../../caches/LRUCache.js'
// Cache for vite define results by config path
// Small cache size since we typically have 1 config per project
const viteDefineCache = new LRUCache(10)
/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async sourceFilePath => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  if (configPath) {
    // Check cache first
    const cached = viteDefineCache.get(configPath)
    if (cached !== undefined) {
      return cached
    }
    try {
      const configUrl = pathToFileURL(configPath).href
      const config =
        (await import(__rewriteRelativeImportExtension(configUrl))).default ??
        (await import(__rewriteRelativeImportExtension(configUrl)))
      const result = config.define ?? {}
      // Cache successful results
      viteDefineCache.set(configPath, result)
      return result
    } catch {
      // Cache empty result for failed imports to avoid repeated attempts
      viteDefineCache.set(configPath, {})
      // config not available or parse error - return empty
    }
  }
  return {}
}
