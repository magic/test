import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'
import { findProjectRoot } from './findProjectRoot.js'
import { parseTsConfig } from './parseTsConfig.js'
import { loadViteAliases } from './loadViteAliases.js'
import { classifyImport } from './classifyImport.js'
export const resolveAlias = async (importPath, sourceFilePath) => {
  const importType = classifyImport(importPath)
  // Only process relative, vite-alias and scoped imports
  if (importType !== 'relative' && importType !== 'vite-alias' && importType !== 'scoped') {
    return null
  }
  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)
  const viteAliases = await loadViteAliases(rootDir)
  const tsAliases = await parseTsConfig(rootDir)
  const allAliases = [...viteAliases, ...tsAliases]
  for (const { find, replacement } of allAliases) {
    let resolved = null
    if (is.string(find)) {
      if (importPath === find || importPath.startsWith(find + '/')) {
        if (importPath === find) {
          resolved = replacement
        } else {
          resolved = importPath.replace(find, replacement)
        }
      }
    } else if (is.regex(find)) {
      const match = importPath.match(find)
      if (match) {
        resolved = importPath.replace(find, replacement)
      }
    }
    if (resolved) {
      // If resolved path already has an extension, check if it exists
      if (path.extname(resolved)) {
        if (await fs.exists(resolved)) {
          return resolved
        }
        return null
      }
      // Check if resolved path is a file (not directory) - if it's a file without extension, return it
      try {
        const stat = await fs.stat(resolved)
        if (stat.isFile()) {
          return resolved
        }
      } catch {}
      // Check if resolved path is a directory (skip it if so)
      try {
        const stat = await fs.stat(resolved)
        if (stat.isDirectory()) {
          const withExtensions = [
            '.ts',
            '.js',
            '.svelte.js',
            '/index.ts',
            '/index.js',
            '/index.svelte.js',
          ]
          for (const ext of withExtensions) {
            const withExt = resolved + ext
            const exists = await fs.exists(withExt)
            if (exists) {
              return withExt
            }
          }
          return null
        }
      } catch {}
      // Try with extensions, handling .js->.ts conversion
      const withExtensions = [
        '.ts',
        '.js',
        '.svelte.js',
        '/index.ts',
        '/index.js',
        '/index.svelte.js',
      ]
      // Also try removing .js extension and adding .ts
      let baseResolved = resolved
      if (resolved.endsWith('.js')) {
        baseResolved = resolved.slice(0, -3) // remove .js
      }
      for (const ext of withExtensions) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          return withExt
        }
        // Also try without .js
        if (baseResolved !== resolved) {
          const noJsExt = baseResolved + ext
          if (await fs.exists(noJsExt)) {
            return noJsExt
          }
        }
      }
    }
  }
  return null
}
