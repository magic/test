import path from 'node:path'
import { findProjectRoot } from './findProjectRoot.js'
import { loadViteConfig } from './loadViteConfig.js'
/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async sourceFilePath => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  const config = await loadViteConfig(rootDir)
  return config.define ?? {}
}
