import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'

import { classifyImport } from './classifyImport.ts'
import { findProjectRoot } from './findProjectRoot.ts'
import { loadViteAliases } from './loadViteAliases.ts'
import { parseTsConfig } from './parseTsConfig.ts'

/**
 * Resolve Vite/SvelteKit aliases ($lib, $app, $env, etc.)
 * This is called from compile.js for non-relative imports
 */
export const resolveViteAlias = async (
  importPath: string,
  sourceFilePath: string,
): Promise<string | null> => {
  const importType = classifyImport(importPath)

  // Only handle vite-alias, bare, and scoped imports here
  if (importType !== 'vite-alias' && importType !== 'bare' && importType !== 'scoped') {
    return null
  }

  const sourceDir = path.dirname(sourceFilePath)
  const rootDir = await findProjectRoot(sourceDir)

  // Use shims for $app/* imports (SvelteKit internal deps can't be resolved in test env)
  if (importPath.startsWith('$app/')) {
    const shimName = importPath.slice(5) // after "$app/"
    const shimPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
    const candidates = [
      shimPath + '.js',
      shimPath + '.ts',
      path.join(shimPath, 'index.js'),
      path.join(shimPath, 'index.ts'),
    ]
    for (const candidate of candidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
    // If not found, fall through to other resolution methods
  }

   // Attempt to resolve using Vite/TSConfig aliases (for any non-relative import)
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
       // Check if file exists with various extensions
       const extensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte', '/index.ts']

       for (const ext of extensions) {
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
       }
     }
   }

   // Fallback: $lib maps to src/lib
   if (importPath.startsWith('$lib')) {
     const aliasPath = importPath.slice(1) // Remove $
     const libPath = path.join(rootDir, 'src', aliasPath)

     const extensions = ['', '.js', '.svelte', '.ts', '/index.js', '/index.svelte', '/index.ts']
     for (const ext of extensions) {
       const withExt = libPath + ext
       if (await fs.exists(withExt)) {
         // Skip if withExt is a directory and ext is empty
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
     }
   }

  // Shim $app/* imports to local test shims
  if (importPath.startsWith('$app/')) {
    const shimName = importPath.slice(5) // after "$app/"
    const shimPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
    const candidates = [
      shimPath + '.js',
      shimPath + '.ts',
      path.join(shimPath, 'index.js'),
      path.join(shimPath, 'index.ts'),
    ]
    for (const candidate of candidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
  }

  return null
}
