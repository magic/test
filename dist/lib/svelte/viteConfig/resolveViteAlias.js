import fs from '@magic/fs'
import is from '@magic/types'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { classifyImport } from './classifyImport.js'
import { findProjectRoot } from './findProjectRoot.js'
import { loadViteAliases } from './loadViteAliases.js'
import { parseTsConfig } from './parseTsConfig.js'
/**
 * Resolve Vite/SvelteKit aliases ($lib, $app, $env, etc.)
 * This is called from compile.js for non-relative imports
 */
export const resolveViteAlias = async (importPath, sourceFilePath) => {
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
    // First, try project-local shims (if the project copied them)
    const projectShimPath = path.join(rootDir, 'src/lib/svelte/shims/$app', shimName)
    const projectCandidates = [
      projectShimPath + '.js',
      projectShimPath + '.ts',
      path.join(projectShimPath, 'index.js'),
      path.join(projectShimPath, 'index.ts'),
    ]
    for (const candidate of projectCandidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
    // Fallback to test runner's bundled shims
    const shimsDir = path.join(__dirname, '..', 'shims', '$app')
    const bundledCandidates = [
      path.join(shimsDir, shimName + '.js'),
      path.join(shimsDir, shimName + '.ts'),
      path.join(shimsDir, shimName, 'index.js'),
      path.join(shimsDir, shimName, 'index.ts'),
    ]
    for (const candidate of bundledCandidates) {
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
  // Fallback: use test runner's own $app shims (if project didn't provide alias/shims)
  if (importPath.startsWith('$app/')) {
    const shimName = importPath.slice(5) // after "$app/"
    const shimsDir = path.join(__dirname, '..', 'shims', '$app')
    const candidates = [
      path.join(shimsDir, shimName + '.js'),
      path.join(shimsDir, shimName + '.ts'),
      path.join(shimsDir, shimName, 'index.js'),
      path.join(shimsDir, shimName, 'index.ts'),
    ]
    for (const candidate of candidates) {
      if (await fs.exists(candidate)) {
        return candidate
      }
    }
  }
  return null
}
