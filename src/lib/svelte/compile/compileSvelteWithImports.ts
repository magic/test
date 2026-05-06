import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import type { CssObject } from './types.ts'

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: string; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath)
  const code = await processImports(js, filePath)

  return { js: code, css }
}
