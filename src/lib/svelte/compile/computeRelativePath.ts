import path from 'node:path'

import { toImportPath } from '../../../bin/lib/pathTransform.js'
import { getCwd } from '../../../constants.js'

export const computeRelativePath = (fromDir: string, toFile: string): string => {
  const absoluteFrom = path.isAbsolute(fromDir) ? fromDir : path.join(getCwd(), fromDir)
  const absoluteTo = path.isAbsolute(toFile) ? toFile : path.join(getCwd(), toFile)
  let relative = path.relative(absoluteFrom, absoluteTo)
  relative = toImportPath(relative)
  if (!relative.startsWith('/') && !relative.startsWith('.')) {
    relative = './' + relative
  }
  return relative
}
