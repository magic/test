import path from 'node:path'

import { TMP_DIR, CWD } from '../../../constants.ts'

export const getTempFilePath = (sourceFilePath: string): string => {
  const rel = path.relative(CWD, sourceFilePath)
  const tmpFile = path.join(TMP_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
