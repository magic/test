import fs from '@magic/fs'
import path from 'node:path'

const EXTENSIONS = ['.ts', '.js']

const hasExtension = (specifier: string): boolean => {
  return EXTENSIONS.some(ext => specifier.endsWith(ext))
}

const tryExtensions = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (specifier: string, context?: object) => Promise<{ url: string }>,
  parentDir?: string,
): Promise<{ url: string }> => {
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

export const resolve = async (
  specifier: string,
  context: { parentURL?: string },
  nextResolve: (specifier: string, context?: object) => Promise<{ url: string }>,
): Promise<{ url: string }> => {
  // Handle relative imports without extension - check .ts first (preferred)
  if (specifier.startsWith('.') && !hasExtension(specifier)) {
    const parentDir = context.parentURL
      ? path.dirname(new URL(context.parentURL).pathname)
      : undefined

    // First try default resolution
    try {
      return await nextResolve(specifier, context)
    } catch {
      return tryExtensions(specifier, context, nextResolve, parentDir)
    }
  }

  // Handle .js files - check if .ts version exists and prefer it
  if (specifier.endsWith('.js')) {
    let basePath = specifier
    if (context.parentURL) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname)
      basePath = path.resolve(parentDir, specifier)
    }

    // Check if corresponding .ts file exists
    const tsPath = basePath.replace(/\.js$/, '.ts')
    const tsExists = await fs.exists(tsPath)

    if (tsExists) {
      const tsSpecifier = specifier.replace(/\.js$/, '.ts')
      return nextResolve(tsSpecifier, context)
    }

    // .ts doesn't exist, try .js as-is
    try {
      return await nextResolve(specifier, context)
    } catch (initialError) {
      // Fallback: try converting .js to .ts
      const tsSpecifier = specifier.replace(/\.js$/, '.ts')
      return nextResolve(tsSpecifier, context)
    }
  }

  return nextResolve(specifier, context)
}
