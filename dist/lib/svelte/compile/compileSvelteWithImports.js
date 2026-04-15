import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
export const compileSvelteWithImports = async filePath => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)
  return { js: { code: processed.code }, css }
}
