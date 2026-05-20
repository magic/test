import path from 'node:path'
import { TMP_DIR, CWD } from '../../../constants.js'
export const getTempFilePath = sourceFilePath => {
  const rel = path.relative(CWD, sourceFilePath)
  const tmpFile = path.join(TMP_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
