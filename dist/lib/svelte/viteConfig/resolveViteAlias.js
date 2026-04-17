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
const SVELTE_EXTENSIONS = ['.ts', '.js', '.svelte.js', '/index.ts', '/index.js', '/index.svelte.js']
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
      try {
        const stat = await fs.stat(resolved)
        if (stat.isDirectory()) {
          for (const ext of SVELTE_EXTENSIONS) {
            const withExt = resolved + ext
            const exists = await fs.exists(withExt)
            if (exists) {
              return withExt
            }
          }
          return null
        }
      } catch {}
      for (const ext of SVELTE_EXTENSIONS) {
        const withExt = resolved + ext
        const exists = await fs.exists(withExt)
        if (exists) {
          return withExt
        }
      }
    }
  }
  if (importPath.startsWith('$lib')) {
    const aliasPath = importPath.slice(1)
    const libPath = path.join(rootDir, 'src', aliasPath)
    // If libPath already has an extension, check if it exists
    if (path.extname(libPath)) {
      if (await fs.exists(libPath)) {
        return libPath
      }
    } else {
      try {
        const stat = await fs.stat(libPath)
        if (stat.isDirectory()) {
          for (const ext of SVELTE_EXTENSIONS) {
            const withExt = libPath + ext
            if (await fs.exists(withExt)) {
              return withExt
            }
          }
          return null
        }
      } catch {}
      for (const ext of SVELTE_EXTENSIONS) {
        const withExt = libPath + ext
        if (await fs.exists(withExt)) {
          return withExt
        }
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
