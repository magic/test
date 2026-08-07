import { compileSvelte } from './compileSvelte.js'
import type { CssObject } from './types.js'

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath, { processImports: true })
  return { js, css }
}
