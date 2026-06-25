import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
export const compileSvelteWithImports = async filePath => {
  const { js, css } = await compileSvelte(filePath)
  const code = await processImports(js, filePath)
  return { js: code, css }
}
