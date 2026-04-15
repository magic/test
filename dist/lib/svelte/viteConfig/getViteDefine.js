import path from 'node:path'
import { findProjectRoot } from './findProjectRoot.js'
import { loadViteDefine } from './loadViteDefine.js'
/**
 * Get vite define variables for a source file
 */
export const getViteDefine = async sourceFilePath => {
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  return await loadViteDefine(rootDir)
}
