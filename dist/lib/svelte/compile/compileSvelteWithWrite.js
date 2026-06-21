import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs/promises'
import { CACHE_DIR, CWD } from '../../../constants.js'
import { transformForNode } from './transformForNode.js'
import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
import { traceStart, traceEnd } from './timing.js'
export const compileSvelteWithWrite = async filePath => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  try {
    // Pure compile (no caching - handled by CacheManager)
    const { js, css } = await compileSvelte(filePath)
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const relPath = path.relative(CWD, resolvedPath)
    const tmpFile = path.join(CACHE_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
    const tmpFileAbs = path.resolve(CWD, tmpFile)
    const importUrl = pathToFileURL(tmpFileAbs).href
    // Transform imports (resolves $app/*, $lib/*, etc.)
    const processId = traceStart('processImports')
    const code = await processImports(js, filePath)
    traceEnd(processId)
    // Node.js compatibility transforms
    const transformId = traceStart('transformForNode')
    const transformedCode = transformForNode(code, filePath)
    traceEnd(transformId)
    // Write to temp file synchronously
    const mkdirId = traceStart('fs.mkdir')
    await fs.mkdir(path.dirname(tmpFileAbs), { recursive: true })
    traceEnd(mkdirId)
    const fileWriteId = traceStart('fs.writeFile')
    await fs.writeFile(tmpFileAbs, transformedCode)
    traceEnd(fileWriteId)
    return { js: transformedCode, css, tmpFile, importUrl }
  } catch (e) {
    traceEnd(id, `ERROR: ${e.message}`)
    throw e
  }
}
