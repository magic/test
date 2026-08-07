import path from 'node:path'

import { findProjectRoot } from './findProjectRoot.ts'
import { loadViteConfig } from './loadViteConfig.ts'

/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async (sourceFilePath: string): Promise<Record<string, unknown>> => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  const config = await loadViteConfig(rootDir)
  return config.define ?? {}
}
