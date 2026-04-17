import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { findProjectRoot } from './findProjectRoot.js'
import { parseTsConfig } from './parseTsConfig.js'
import { loadViteAliases } from './loadViteAliases.js'
import { classifyImport } from './classifyImport.js'

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
          // Skip if withExt is a directory and ext is empty (raw resolved path is a directory)
          if (ext === '') {
            try {
              const stat = await fs.stat(withExt)
              if (stat.isDirectory()) {
                continue
              }
            } catch {
              continue
            }
          }
          return withExt
        }
        // Also try without .js
        if (baseResolved !== resolved) {
          const noJsExt = baseResolved + ext
          if (await fs.exists(noJsExt)) {
            // Similarly, skip if noJsExt is a directory when ext is empty?
            // baseResolved likely is a file without extension, but if ext is '' then noJsExt = baseResolved (file). Check directory?
            if (ext === '') {
              try {
                const stat = await fs.stat(noJsExt)
                if (stat.isDirectory()) {
                  continue
                }
              } catch {
                continue
              }
            }
            return noJsExt
          }
        }
      }
    }
  }

  return null
}
