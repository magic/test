import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'

import { CWD } from '../../../constants.ts'

export const writeCompiledFile = async (
  tempPath: string,
  code: string,
  map?: string,
  sourceMapRef = false,
): Promise<{ tmpFile: string; importUrl: string }> => {
  const tmpFileAbs = path.resolve(CWD, tempPath)

  await mkdir(path.dirname(tmpFileAbs), { recursive: true })

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
    await writeFile(tmpFileAbs + '.map', JSON.stringify(mapObj))
  }

  await writeFile(tmpFileAbs, contentToWrite)

  const importUrl = pathToFileURL(tmpFileAbs).href
  return { tmpFile: tempPath, importUrl }
}
