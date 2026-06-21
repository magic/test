import path from 'node:path'

import { CACHE_DIR, CWD } from '../../../constants.ts'

export const getTempFilePath = (sourceFilePath: string): string => {
  const rel = path.relative(CWD, sourceFilePath)
  const tmpFile = path.join(CACHE_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
