import { compileSvelte } from './compileSvelte.ts'
import { processImports } from './processImports.ts'
import type { CssObject } from './types.ts'

export const compileSvelteWithImports = async (
  filePath: string,
): Promise<{ js: { code: string }; css: CssObject | null }> => {
  const { js, css } = await compileSvelte(filePath)
  const processed = await processImports(js.code, filePath)

  return { js: { code: processed.code }, css }
}
