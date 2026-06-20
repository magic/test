import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

import { TMP_DIR, CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'
import { transformForNode } from './transformForNode.ts'
import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import { traceStart, traceEnd } from './timing.ts'

export const compileSvelteWithWrite = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null; tmpFile: string; importUrl: string }> => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  try {
    const { js, css } = await compileSvelte(filePath)

    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const relPath = path.relative(CWD, resolvedPath)
    const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(CWD, tmpFile)
    const importUrl = pathToFileURL(tmpFileAbs).href

    // Check disk cache for fully transformed file
    // Cache key: file path + source mtime
    try {
      const sourceStats = await fs.stat(resolvedPath)
      const compiledStats = await fs.stat(tmpFileAbs)
      if (compiledStats.mtimeMs >= sourceStats.mtimeMs) {
        // Return cached file directly - it's already fully transformed
        const cachedJs = await fs.readFile(tmpFileAbs, 'utf-8')
        traceEnd(id, 'disk cache hit')
        return { js: cachedJs, css, tmpFile, importUrl }
      }
    } catch {
      // File doesn't exist or is stale - continue with compilation
    }

    // Cache miss - do the full work
    const processId = traceStart('processImports')
    const code = await processImports(js, filePath)
    traceEnd(processId)

    const transformId = traceStart('transformForNode')
    const transformedCode = transformForNode(code, filePath)
    traceEnd(transformId)

    await fs.mkdirp(path.dirname(tmpFileAbs))
    const writeId = traceStart('fs.writeFile')
    await fs.writeFile(tmpFileAbs, transformedCode)
    traceEnd(writeId)

    traceEnd(id, 'compiled')
    return { js: transformedCode, css, tmpFile, importUrl }
  } catch (e) {
    traceEnd(id, `ERROR: ${(e as Error).message}`)
    throw e
  }
}
