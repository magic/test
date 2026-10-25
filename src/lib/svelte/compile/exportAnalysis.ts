/* ---------------------------------------------------------------------------
 * Export-graph analysis for the Svelte compile pipeline.
 *
 * Pure helpers that walk re-export chains (via the AST parser) to answer:
 * which exports resolve to .svelte files, and which named imports a file
 * pulls from a given specifier. Used by resolveSvelteOnlyExports.ts and
 * resolveAndCompileImport.ts.
 * -------------------------------------------------------------------------- */

import path from 'node:path'

import fs from '@magic/fs'

import { parseFile, extractExports, extractImportedNamesFromCode } from './astParse.js'
import { LRUCache } from '../../caches/LRUCache.js'
import type { ExportInfo } from './types.js'

export interface ExportVisitor {
  onSvelteExport: (name: string, resolvedPath: string) => boolean // return false to stop
  onSvelteDefault: (defaultName: string, resolvedPath: string) => boolean
  onJsExport: (exp: ExportInfo) => boolean
}

export const traverseExports = async (
  filePath: string,
  visitor: ExportVisitor,
  visited: Set<string> = new Set(),
): Promise<void> => {
  if (visited.has(filePath)) {
    return
  }
  visited.add(filePath)

  const content = await fs.readFile(filePath, 'utf-8')
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)
  const fileDir = path.dirname(filePath)

  for (const exp of exports) {
    if (exp.isBatch && exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onSvelteDefault(path.basename(resolved, '.svelte'), resolved)) {
        return
      }
    } else if (exp.source?.endsWith('.svelte')) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onSvelteExport(exp.alias || exp.name, resolved)) {
        return
      }
    } else if (exp.source) {
      const resolved = path.resolve(fileDir, exp.source)
      if (!visitor.onJsExport(exp)) {
        return
      }
      await traverseExports(resolved, visitor, visited)
    } else if (!exp.source) {
      if (!visitor.onJsExport(exp)) {
        return
      }
    }
  }
}

export const extractNamedExportsRecursive = async (filePath: string): Promise<ExportInfo[]> => {
  const result: ExportInfo[] = []
  await traverseExports(filePath, {
    onSvelteExport: name => {
      result.push({ name, source: null, isType: false, isDefault: false, isBatch: false })
      return true
    },
    onSvelteDefault: defaultName => {
      result.push({
        name: defaultName,
        source: null,
        isType: false,
        isDefault: false,
        isBatch: false,
      })
      return true
    },
    onJsExport: exp => {
      if (exp.name && !exp.name.startsWith('type')) {
        result.push(exp)
      }
      return true
    },
  })
  return result
}

export const findSvelteFileForExport = async (
  filePath: string,
  exportName: string,
): Promise<string | null> => {
  let found: string | null = null
  await traverseExports(filePath, {
    onSvelteExport: (name, resolvedPath) => {
      if (name === exportName) {
        found = resolvedPath
        return false
      }
      return true
    },
    onSvelteDefault: (defaultName, resolvedPath) => {
      if (defaultName === exportName) {
        found = resolvedPath
        return false
      }
      return true
    },
    onJsExport: () => true,
  })
  return found
}

export interface ExportSource {
  svelte: string | null
  js: string | null
  jsExportName: string | null
}

/**
 * Resolve a named export of a (possibly transitive) barrel to the concrete file
 * that provides it: either a `.svelte` file (component — always a default export)
 * or a `.js` file (util / re-export source). Walks `export * from` and
 * `export { x } from` chains with cycle detection.
 *
 * For a `.js` source, `jsExportName` is the name the SOURCE file exports (which
 * may differ from the barrel's export name when the barrel aliases it,
 * e.g. `export { cn as classnames } from './x.js'`). The caller re-exports as
 * `export { jsExportName as <consumerName> } from '<js>'`.
 *
 * Returns at most one of `svelte` / `js` non-null; both null when unresolvable.
 */
export const findExportSourceFile = async (
  entryPath: string,
  exportName: string,
): Promise<ExportSource> => {
  const result: ExportSource = { svelte: null, js: null, jsExportName: null }
  const visited = new Set<string>()
  const find = async (filePath: string): Promise<boolean> => {
    if (visited.has(filePath)) {
      return false
    }
    visited.add(filePath)
    let content: string
    try {
      content = await fs.readFile(filePath, 'utf-8')
    } catch {
      return false
    }
    const fileInfo = await parseFile(content, filePath)
    const exports = extractExports(fileInfo)
    const dir = path.dirname(filePath)
    for (const exp of exports) {
      const exportNameOut = exp.alias || exp.name
      if (exp.isBatch && exp.source?.endsWith('.svelte')) {
        if (path.basename(exp.source, '.svelte') === exportName) {
          result.svelte = path.resolve(dir, exp.source)
          return true
        }
      } else if (exp.source?.endsWith('.svelte')) {
        if (exportNameOut === exportName) {
          result.svelte = path.resolve(dir, exp.source)
          return true
        }
      } else if (exportNameOut === exportName) {
        if (exp.source) {
          result.js = path.resolve(dir, exp.source)
          result.jsExportName = exp.name
          return true
        }
        // Local definition (export const x / export function x) in this file.
        result.js = filePath
        result.jsExportName = exp.name
        return true
      }
    }
    // Recurse into `export * from` sub-barrels (only batch .js re-exports can
    // hide the name without a matching named export at this level).
    for (const exp of exports) {
      if (
        exp.isBatch &&
        exp.source &&
        (exp.source.endsWith('.js') || exp.source.endsWith('.mjs'))
      ) {
        if (await find(path.resolve(dir, exp.source))) {
          return true
        }
      }
    }
    return false
  }
  await find(path.resolve(entryPath))
  return result
}

export const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  // Return the IMPORTED names (the source package's export names), not the
  // local aliases. Using local names here (the previous behavior) broke
  // aliased imports: `import { Button as B }` looked up 'B' instead of 'Button'.
  return extractImportedNamesFromCode(code, spec)
}

// Cache of "does this file transitively re-export at least one .svelte file".
// Keyed by resolved absolute path; the export graph is stable for a run.
const isSvelteBarrelCache = new LRUCache<boolean>(2048)

/**
 * True when `filePath` (a JS module) transitively re-exports at least one
 * `.svelte` file — i.e. it is a "svelte barrel" (directly, or via `export *
 * from './sub.js'` sub-barrels). Walks the export graph with cycle detection
 * and stops at the first `.svelte` export, so it is cheap for the common case.
 */
export const isSvelteBarrel = async (filePath: string): Promise<boolean> => {
  const key = path.resolve(filePath)
  const cached = isSvelteBarrelCache.get(key)
  if (cached !== undefined) {
    return cached
  }
  let found = false
  await traverseExports(key, {
    onSvelteExport: () => {
      found = true
      return false
    },
    onSvelteDefault: () => {
      found = true
      return false
    },
    onJsExport: () => true,
  })
  isSvelteBarrelCache.set(key, found)
  return found
}
