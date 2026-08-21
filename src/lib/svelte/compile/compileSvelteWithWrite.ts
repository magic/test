import path from 'node:path'

import { CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'
import { transformForNode } from './transformForNode.ts'
import { processImports } from './processImports.ts'
import { compileSvelte } from './compileSvelte.ts'
import { getTempFilePath } from './getTempFilePath.ts'
import { writeCompiledFile } from './fileWriter.ts'
import { traceStart, traceEnd } from '../../trace/timing.ts'

export const compileSvelteWithWrite = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null; tmpFile: string; importUrl: string }> => {
  const id = traceStart(`compileSvelteWithWrite ${path.basename(filePath)}`)
  try {
    const { js, css, map } = await compileSvelte(filePath)

    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(CWD, filePath)
    const tmpFile = getTempFilePath(resolvedPath)
    const tmpFileAbs = path.resolve(CWD, tmpFile)

    // Transform imports (resolves $app/*, $lib/*, etc.)
    const processId = traceStart('processImports')
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
    traceEnd(id, `ERROR: ${(e as Error).message}`)
    throw e
  }
}
