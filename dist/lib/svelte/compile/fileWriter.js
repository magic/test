import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'
import { CWD } from '#src/constants.js'
export const writeCompiledFile = async (tempPath, code, map, sourceMapRef = false) => {
  const tmpFileAbs = path.resolve(CWD, tempPath)
  await fs.mkdirp(path.dirname(tmpFileAbs), { recursive: true })
  let contentToWrite = code
  if (sourceMapRef && map) {
    const sourceMapComment = `//# sourceMappingURL=${path.basename(tmpFileAbs)}.map\n`
    contentToWrite = code + sourceMapComment
    // Write source map file for c8 coverage remapping
    const mapObj = JSON.parse(map)
    if (mapObj.sources && mapObj.sources.length > 0 && !path.isAbsolute(mapObj.sources[0])) {
      mapObj.sources = [tempPath.startsWith('file://') ? tempPath.slice(7) : tempPath]
      mapObj.sourceRoot = ''
    }
    await fs.writeFile(tmpFileAbs + '.map', JSON.stringify(mapObj))
  }
  await fs.writeFile(tmpFileAbs, contentToWrite)
  const importUrl = pathToFileURL(tmpFileAbs).href
  return { tmpFile: tempPath, importUrl }
}
//# sourceMappingURL=fileWriter.js.map
