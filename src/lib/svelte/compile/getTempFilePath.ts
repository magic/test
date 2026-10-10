import path from 'node:path'

import { CACHE_DIR, getCwd } from '../../../constants.js'

export const getTempFilePath = (sourceFilePath: string): string => {
  const rel = path.relative(getCwd(), sourceFilePath)
  const tmpFile = path.join(CACHE_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
