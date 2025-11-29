/**
 * @param {string} specifier - The module specifier to resolve
 * @param {{
 *   conditions: string[],
 *   importAttributes: Record<string, string>,
 *   parentURL: string | undefined
 * }} context - The resolution context
 * @param {(specifier: string, context: any) => Promise<{
 *   url: string,
 *   format?: string,
 *   shortCircuit?: boolean
 * }>} nextResolve - The next resolver in the chain
 * @returns {Promise<{
 *   url: string,
 *   format?: string,
 *   shortCircuit?: boolean
 * }>} The resolved module information
 */
export const resolve = async (specifier, context, nextResolve) => {
  if (specifier.endsWith('.js')) {
    try {
      return await nextResolve(specifier, context)
    } catch {
      const tsSpecifier = specifier.replace(/\.js$/, '.ts')
      return await nextResolve(tsSpecifier, context)
    }
  }

  return nextResolve(specifier, context)
}
