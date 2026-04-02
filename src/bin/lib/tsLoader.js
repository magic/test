import fs from '@magic/fs'
import path from 'node:path'

/**
 * @param {string} specifier - The module specifier to resolve
 * @param {{
 *   conditions: string[],
 *   importAttributes: Record<string, string>,
 *   parentURL: string | undefined
 * }} context - The resolution context
 * @param {(specifier: string, context: unknown) => Promise<{
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
    } catch (initialError) {
      // Check if .js file actually exists on disk
      let jsPath = specifier
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        jsPath = path.resolve(parentDir, specifier)
      }

      const jsExists = await fs.exists(jsPath)

      if (!jsExists) {
        // .js doesn't exist, try .ts
        const tsSpecifier = specifier.replace(/\.js$/, '.ts')
        return nextResolve(tsSpecifier, context)
      }

      // .js exists but failed to load - rethrow original error
      throw initialError
    }
  }

  return nextResolve(specifier, context)
}
