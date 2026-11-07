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
import fs from '@magic/fs'
import { pathToFileURL } from 'node:url'
import { findConfigFile } from './findConfigFile.js'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.js'
import { defineCache, configCache } from './cache.js'
import { normalizeAlias } from './normalizeAlias.js'
export const loadViteConfig = async rootDir => {
  const cacheKey = rootDir + ':vite-full'
  const cached = configCache.get(cacheKey)
  if (cached) {
    // Validate against the filesystem before trusting the cache: this module
    // keeps per-thread state (the ESM loader has its own), and a vite config
    // may appear, disappear or change after the first lookup (tests write
    // vite.config.js mid-run). mtime 0 + size 0 marks "no config file".
    const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
    if (!configPath) {
      if (cached.mtime === 0 && cached.size === 0) {
        return cached.config
      }
    } else {
      try {
        const stat = await fs.stat(configPath)
        if (stat.mtimeMs === cached.mtime && stat.size === cached.size) {
          return cached.config
        }
      } catch {
        // Config unreadable — fall through and reload
      }
    }
  }
  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)
  if (!configPath) {
    configCache.set(cacheKey, { config: {}, mtime: 0, size: 0 })
    return {}
  }
  try {
    const stat = await fs.stat(configPath)
    // Cache-bust with mtime+size so a changed config is re-evaluated —
    // Node's ESM module cache would otherwise return the stale module for
    // the same URL (mtime alone ties for sub-tick rewrites).
    const configUrl = `${pathToFileURL(configPath).href}?t=${stat.mtimeMs}-${stat.size}`
    const mod = await import(__rewriteRelativeImportExtension(configUrl))
    const config = mod.default ?? mod
    // Cache define
    const define = config.define ?? {}
    defineCache.set(rootDir + ':vite-define', define)
    configCache.set(cacheKey, { config, mtime: stat.mtimeMs, size: stat.size })
    return config
  } catch {
    // Broken config: don't cache it so the next lookup retries
    return {}
  }
}
export const getViteAliases = (config, configDir) => {
  return normalizeAlias(config.resolve?.alias, configDir)
}
export const getViteDefine = config => {
  return config.define ?? {}
}
//# sourceMappingURL=loadViteConfig.js.map
