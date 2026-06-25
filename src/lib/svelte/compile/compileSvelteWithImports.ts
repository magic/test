import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
import type { CssObject } from './types.js'

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath)
  const code = await processImports(js, filePath)
  return { js: code, css }
}
