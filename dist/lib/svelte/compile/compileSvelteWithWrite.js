import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from '@magic/fs'
import { TMP_DIR } from './constants.js'
import { compileSvelteWithImports } from './compileSvelteWithImports.js'
import { transformForNode } from './transformForNode.js'
export const compileSvelteWithWrite = async (filePath, importChain = []) => {
  const { js, css } = await compileSvelteWithImports(filePath, importChain)
  const transformedCode = transformForNode(js.code, filePath)
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const tmpFileAbs = path.resolve(process.cwd(), tmpFile)
  const importUrl = pathToFileURL(tmpFileAbs).href
  await fs.mkdirp(path.dirname(tmpFileAbs))
  await fs.writeFile(tmpFileAbs, transformedCode)
  return { js: { code: transformedCode }, css, tmpFile, importUrl }
}
