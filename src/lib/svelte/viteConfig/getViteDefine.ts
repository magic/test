import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findProjectRoot } from './findProjectRoot.ts'
import { findConfigFile } from './findConfigFile.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'
import { LRUCache } from '../../caches/LRUCache.ts'

// Cache for vite define results by config path
// Small cache size since we typically have 1 config per project
const viteDefineCache = new LRUCache<Record<string, unknown>>(10)

/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async (sourceFilePath: string): Promise<Record<string, unknown>> => {
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
      const config = (await import(configUrl)).default ?? (await import(configUrl))
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
