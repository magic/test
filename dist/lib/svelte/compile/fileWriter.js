import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

import { getCwd } from '../../../constants.js'
import { writeAtomic } from '../../caches/persistentCache.js'
// ---------------------------------------------------------------------------
// Shared source-map plumbing.
//
// V8 coverage remapping only works when the compiled .svelte.js file carries
// the trailing `//# sourceMappingURL=<name>.map` comment AND the .map file
// exists next to it. compileSvelteWithWrite has always done both (its
// "canonical" content); the import-resolution compile paths (import
// processing in resolveAndCompileImport, barrel export compiles) used to
// persist their output WITHOUT the comment/map, so components compiled only
// as dependencies of a mount showed 0% in the report — and the polluted
// state persisted in the cache until it was wiped. These helpers are the
// single owner of the comment format and the .map rewrite, so every write
// path produces byte-identical output.
// ---------------------------------------------------------------------------
export const sourceMapCommentFor = tmpFileAbs =>
  `//# sourceMappingURL=${path.basename(tmpFileAbs)}.map\n`
// Rewrite `sources[0]` to the absolute source path and write the .map sidecar
// next to the compiled file. Returns true when a sidecar was written.
export const writeMapSidecar = async (tmpFileAbs, map, sourcePath) => {
  if (!map) {
    return false
  }
  const mapObj = JSON.parse(map)
  // Preserve original source reference from Svelte compiler (points to .svelte file)
  // Do NOT replace with tempPath — that breaks coverage mapping back to source.
  // The Svelte compiler emits only the source basename in `sources` (e.g.
  // "Toggle.svelte") regardless of the `filename` option, so resolve it against
  // the actual source file's directory — resolving against getCwd() would produce a
  // bogus path like "<getCwd()>/Toggle.svelte" for nested components.
  if (mapObj.sources && mapObj.sources.length > 0) {
    if (!path.isAbsolute(mapObj.sources[0])) {
      const baseDir = sourcePath ? path.dirname(sourcePath) : getCwd()
      mapObj.sources = [path.resolve(baseDir, mapObj.sources[0])]
    }
    mapObj.sourceRoot = ''
  }
  await writeAtomic(tmpFileAbs + '.map', JSON.stringify(mapObj))
  return true
}
export const writeCompiledFile = async (tempPath, code, map, sourceMapRef = false, sourcePath) => {
  const tmpFileAbs = path.resolve(getCwd(), tempPath)
  await fs.mkdirp(path.dirname(tmpFileAbs), { recursive: true })
  let contentToWrite = code
  if (sourceMapRef) {
    const sourceMapComment = sourceMapCommentFor(tmpFileAbs)
    // Callers may already have appended the comment (compileSvelteWithWrite
    // bakes it into the "canonical" string it also hands to recordCompile —
    // the two writers must produce byte-identical content or the file mtime
    // churns on every compile). Append only when missing.
    if (map && !code.endsWith(sourceMapComment)) {
      contentToWrite = code + sourceMapComment
    }
    // Write source map file for c8 coverage remapping
    await writeMapSidecar(tmpFileAbs, map, sourcePath)
  }
  await writeAtomic(tmpFileAbs, contentToWrite)
  const importUrl = pathToFileURL(tmpFileAbs).href
  return { tmpFile: tempPath, importUrl }
}
//# sourceMappingURL=fileWriter.js.map
