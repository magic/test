import path from 'node:path'
import fs from '@magic/fs'

import { parseFile, extractExports } from './astParse.ts'
import { resolveImportMapSpecifier, findNearestPackageJson } from './resolveImportMap.ts'
import { barrelCache, pendingPromises } from '#src/lib/caches/cache.js'
import { traceStart, traceEnd } from '#src/lib/trace/timing.js'

export const getSvelteExports = async (
  filePath: string,
): Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]> => {
  const id = traceStart(`getSvelteExports ${path.basename(filePath)}`)

  // Check if another process is already getting exports for this file
  const pending = pendingPromises.get(`exports:${filePath}`) as
    Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]> | undefined
  if (pending) {
    traceEnd(id, 'waiting for pending')
    const result = await pending
    return result
  }

  // Check barrelCache first (contains exports from previous barrel compilations)
  const cached = barrelCache.get(filePath)
  if (cached) {
    traceEnd(id, 'cache hit')
    return cached.exports
  }

  // Create promise and store it for other callers to await
  const exportsPromise = (async () => {
    try {
      return await getSvelteExportsImpl(filePath)
    } finally {
      pendingPromises.delete(`exports:${filePath}`)
    }
  })()

  pendingPromises.set(`exports:${filePath}`, exportsPromise)

  const result = await exportsPromise
  traceEnd(id)
  return result
}

const getSvelteExportsImpl = async (
  filePath: string,
): Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]> => {
  const content = await fs.readFile(filePath, 'utf-8')
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)

  const result: { name: string; path: string; isDefaultReexport?: boolean }[] = []

  for (const exp of exports) {
    if (exp.isBatch && exp.source?.endsWith('.svelte')) {
      // export * from './foo.svelte' - extract default name
      const svelteDefaultName = path.basename(exp.source, '.svelte')
      result.push({
        name: svelteDefaultName,
        path: await resolveExportPath(filePath, exp.source),
      })
    } else if (exp.source?.endsWith('.svelte')) {
      // export { x } from './foo.svelte'
      const resolvedPath = await resolveExportPath(filePath, exp.source)
      const exportedName = exp.alias || exp.name
      if (exportedName && exportedName !== 'type') {
        result.push({
          name: exportedName,
          path: resolvedPath,
          isDefaultReexport: exp.name === 'default',
        })
      }
    }
  }

  return result
}

// Resolve a re-export source to an absolute file path.
// "#-prefixed" specifiers are package.json import-map entries
// (e.g. "#lib/*": "./src/lib/*"), not relative paths - resolving them
// against the source directory produces bogus paths like
// "src/lib/#lib/forms/Form.svelte". They are resolved against the barrel
// file's own package scope (nearest package.json), matching Node's ESM
// semantics for import-map specifiers.
const resolveExportPath = async (filePath: string, expSource: string): Promise<string> => {
  if (expSource.startsWith('#')) {
    const pkgJsonPath = await findNearestPackageJson(path.resolve(filePath))
    const resolved = await resolveImportMapSpecifier(expSource, pkgJsonPath)
    if (resolved) {
      return resolved
    }
  }
  return path.resolve(path.dirname(filePath), expSource)
}
