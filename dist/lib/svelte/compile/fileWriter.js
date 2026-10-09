import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'
import { CWD } from '#src/constants.js'
export const writeCompiledFile = async (tempPath, code, map, sourceMapRef = false, sourcePath) => {
  const tmpFileAbs = path.resolve(CWD, tempPath)
  await fs.mkdirp(path.dirname(tmpFileAbs), { recursive: true })
  let contentToWrite = code
  if (sourceMapRef && map) {
    const sourceMapComment = `//# sourceMappingURL=${path.basename(tmpFileAbs)}.map\n`
    contentToWrite = code + sourceMapComment
    // Write source map file for c8 coverage remapping
    const mapObj = JSON.parse(map)
    // Preserve original source reference from Svelte compiler (points to .svelte file)
    // Do NOT replace with tempPath — that breaks coverage mapping back to source.
    // The Svelte compiler emits only the source basename in `sources` (e.g.
    // "Toggle.svelte") regardless of the `filename` option, so resolve it against
    // the actual source file's directory — resolving against CWD would produce a
    // bogus path like "<CWD>/Toggle.svelte" for nested components.
    if (mapObj.sources && mapObj.sources.length > 0) {
      if (!path.isAbsolute(mapObj.sources[0])) {
        const baseDir = sourcePath ? path.dirname(sourcePath) : CWD
        mapObj.sources = [path.resolve(baseDir, mapObj.sources[0])]
      }
      mapObj.sourceRoot = ''
    }
    await fs.writeFile(tmpFileAbs + '.map', JSON.stringify(mapObj))
  }
  await fs.writeFile(tmpFileAbs, contentToWrite)
  const importUrl = pathToFileURL(tmpFileAbs).href
  return { tmpFile: tempPath, importUrl }
}
//# sourceMappingURL=fileWriter.js.map
