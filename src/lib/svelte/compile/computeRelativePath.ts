import path from 'node:path'

import { CWD } from '../../../constants.ts'

export const computeRelativePath = (fromDir: string, toFile: string): string => {
  const absoluteFrom = path.isAbsolute(fromDir) ? fromDir : path.join(CWD, fromDir)
  const absoluteTo = path.isAbsolute(toFile) ? toFile : path.join(CWD, toFile)
  let relative = path.relative(absoluteFrom, absoluteTo)
  relative = relative.replace(/\\/g, '/')
  if (!relative.startsWith('/') && !relative.startsWith('.')) {
    relative = './' + relative
  }
  return relative
}
