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
/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async sourceFilePath => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  if (configPath) {
    try {
      const configUrl = pathToFileURL(configPath).href
      const config =
        (await import(__rewriteRelativeImportExtension(configUrl))).default ??
        (await import(__rewriteRelativeImportExtension(configUrl)))
      return config.define ?? {}
    } catch {
      // config not available or parse error - return empty
    }
  }
  return {}
}
