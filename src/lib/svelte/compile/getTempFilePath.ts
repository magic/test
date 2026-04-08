import path from 'node:path'

import { TMP_DIR } from './constants'

export const getTempFilePath = (sourceFilePath: string): string => {
  const cwd = process.cwd()
  const rel = path.relative(cwd, sourceFilePath)
  const tmpFile = path.join(TMP_DIR, rel.replace(/\.svelte$/, '.svelte.js'))
  return tmpFile
}
