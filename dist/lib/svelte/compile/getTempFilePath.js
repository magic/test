import path from 'node:path'
import { TMP_DIR } from './constants.js'
export const getTempFilePath = sourceFilePath => {
  const cwd = process.cwd()
  const rel = path.relative(cwd, sourceFilePath)
  const tmpFile = path.join(TMP_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
