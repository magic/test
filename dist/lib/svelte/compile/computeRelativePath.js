import path from 'node:path'
export const computeRelativePath = (fromDir, toFile) => {
  const absoluteFrom = path.isAbsolute(fromDir) ? fromDir : path.join(process.cwd(), fromDir)
  const absoluteTo = path.isAbsolute(toFile) ? toFile : path.join(process.cwd(), toFile)
  let relative = path.relative(absoluteFrom, absoluteTo)
  relative = relative.replace(/\\/g, '/')
  if (!relative.startsWith('/') && !relative.startsWith('.')) {
    relative = './' + relative
  }
  return relative
}
