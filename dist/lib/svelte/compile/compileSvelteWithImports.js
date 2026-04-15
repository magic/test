import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
export const compileSvelteWithImports = async (filePath, importChain = []) => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath, importChain)
  return { js: { code: processed.code }, css }
}
