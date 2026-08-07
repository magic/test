import { compileSvelte } from './compileSvelte.js'
export const compileSvelteWithImports = async filePath => {
  const { js, css } = await compileSvelte(filePath, { processImports: true })
  return { js, css }
}
