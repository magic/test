import fs from '@magic/fs'
import path from 'node:path'

const EXTENSIONS = ['.js', '.ts']

/** @param {string} specifier */
const hasExtension = specifier => {
  return EXTENSIONS.some(ext => specifier.endsWith(ext))
}

/**
 * @param {string} specifier
 * @param {object} context
 * @param {(specifier: string, context?: object) => Promise<{ url: string }>} nextResolve
 * @param {string | undefined} parentDir
 */
const tryExtensions = async (specifier, context, nextResolve, parentDir) => {
  for (const ext of EXTENSIONS) {
    const trySpecifier = specifier + ext
    let tryPath = trySpecifier
    if (parentDir) {
      tryPath = path.resolve(parentDir, trySpecifier)
    }

    const exists = await fs.exists(tryPath)
    if (exists) {
      try {
        return await nextResolve(trySpecifier, context)
      } catch {
        // This extension failed, try next
      }
    }
  }

  throw new Error(`Cannot find module ${specifier}`)
}

/**
 * @param {string} specifier
 * @param {{ parentURL?: string }} context
 * @param {(specifier: string, context?: object) => Promise<{ url: string }>} nextResolve
 */
export const resolve = async (specifier, context, nextResolve) => {
  if (specifier.startsWith('.') && !hasExtension(specifier)) {
    const parentDir = context.parentURL
      ? path.dirname(new URL(context.parentURL).pathname)
      : undefined

    try {
      return await nextResolve(specifier, context)
    } catch {
      return tryExtensions(specifier, context, nextResolve, parentDir)
    }
  }

  if (specifier.endsWith('.js')) {
    try {
      return await nextResolve(specifier, context)
    } catch (initialError) {
      let jsPath = specifier
      if (context.parentURL) {
        const parentDir = path.dirname(new URL(context.parentURL).pathname)
        jsPath = path.resolve(parentDir, specifier)
      }

      const jsExists = await fs.exists(jsPath)

      if (!jsExists) {
        const tsSpecifier = specifier.replace(/\.js$/, '.ts')
        return nextResolve(tsSpecifier, context)
      }

      throw initialError
    }
  }

  return nextResolve(specifier, context)
}
