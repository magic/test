import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findProjectRoot } from './findProjectRoot.ts'
import { findConfigFile } from './findConfigFile.ts'
import { VITE_CONFIG_NAMES } from './VITE_CONFIG_NAMES.ts'

/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async (sourceFilePath: string): Promise<Record<string, unknown>> => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  const configPath = await findConfigFile(rootDir, VITE_CONFIG_NAMES)

  if (configPath) {
    try {
      const configUrl = pathToFileURL(configPath).href
      const config = (await import(configUrl)).default ?? (await import(configUrl))
      return config.define ?? {}
    } catch {
      // config not available or parse error - return empty
    }
  }
  return {}
}
