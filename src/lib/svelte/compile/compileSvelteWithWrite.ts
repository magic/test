import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'

import { TMP_DIR, CWD } from '../../../constants.ts'
import type { CssObject } from './types.ts'
import { transformForNode } from './transformForNode.ts'
import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'

export const compileSvelteWithWrite = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null; tmpFile: string; importUrl: string }> => {
  const { js, css } = await compileSvelte(filePath)
  const code = await processImports(js, filePath)

  const transformedCode = transformForNode(code, filePath)

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
  const importUrl = pathToFileURL(tmpFileAbs).href

  await fs.mkdirp(path.dirname(tmpFileAbs))
  await fs.writeFile(tmpFileAbs, transformedCode)

  return { js: transformedCode, css, tmpFile, importUrl }
}
