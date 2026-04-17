import { compileSvelte } from './compileSvelte.js'
import { processImports } from './processImports.js'
import type { CssObject } from './types.js'

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: { code: string }; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)

  return { js: { code: processed.code }, css }
}
