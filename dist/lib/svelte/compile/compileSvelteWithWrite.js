import path from 'node:path'
import { CWD } from '../../../constants.js'
import { transformForNode } from './transformForNode.js'
import { compileSvelte } from './compileSvelte.js'
import { getTempFilePath } from './getTempFilePath.js'
import { writeCompiledFile } from './fileWriter.js'
import { traceStart, traceEnd } from '../../trace/timing.js'
export const compileSvelteWithWrite = async filePath => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  try {
    const { js, css, map } = await compileSvelte(filePath)
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const tmpFile = getTempFilePath(resolvedPath)
    const tmpFileAbs = path.resolve(CWD, tmpFile)
    // Transform imports (resolves $app/*, $lib/*, etc.)
    const processId = traceStart('processImports')
    const { processImports } = await import('./processImports.js')
    const code = await processImports(js, filePath)
    traceEnd(processId)
    // Node.js compatibility transforms
    const transformId = traceStart('transformForNode')
    const transformedCode = transformForNode(code, filePath)
    traceEnd(transformId)
    const { tmpFile: writtenTmpFile, importUrl } = await writeCompiledFile(
      tmpFile,
      transformedCode + `//# sourceMappingURL=${path.basename(tmpFileAbs)}.map\n`,
      map,
      true,
    )
    return { js: transformedCode, css, tmpFile: writtenTmpFile, importUrl }
  } catch (e) {
    traceEnd(id, `ERROR: ${e.message}`)
    throw e
  }
}
