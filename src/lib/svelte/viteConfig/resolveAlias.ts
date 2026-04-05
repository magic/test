import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { findProjectRoot } from './findProjectRoot.ts'
import { parseTsConfig } from './parseTsConfig.ts'
import { loadViteAliases } from './loadViteAliases.ts'
import { classifyImport } from './classifyImport.ts'

export const resolveAlias = async (
  importPath: string,
  sourceFilePath: string,
): Promise<string | null> => {
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
    let resolved: string | null = null

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
      const exists = await fs.exists(resolved)
      if (exists) {
        return resolved
      }

      // Try with extensions, handling .js->.ts conversion
      const withExtensions = [
        '',
        '.js',
        '.svelte',
        '.ts',
        '/index.js',
        '/index.svelte',
        '/index.ts',
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
