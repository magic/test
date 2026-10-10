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

import { parseFile, extractExports, extractImportsSync } from './astParse.js'
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

export const extractNamedImportsFromCode = (code: string, spec: string): string[] => {
  const imports = extractImportsSync(code)
  const imp = imports.find(i => i.source === spec)
  return imp?.localNames ?? []
}
