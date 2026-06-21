import path from 'node:path'
import { CACHE_DIR, CWD } from '../../../constants.js'
export const getTempFilePath = sourceFilePath => {
  const rel = path.relative(CWD, sourceFilePath)
  const tmpFile = path.join(CACHE_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
