import path from 'node:path'
import fs from '@magic/fs'
import { parseFile, extractExports } from './astParse.js'
import { barrelCache, pendingPromises } from '#src/lib/caches/cache.js'
import { traceStart, traceEnd } from '#src/lib/trace/timing.js'
export const getSvelteExports = async filePath => {
  const id = traceStart(`getSvelteExports ${path.basename(filePath)}`)
  // Check if another process is already getting exports for this file
  const pending = pendingPromises.get(`exports:${filePath}`)
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
const getSvelteExportsImpl = async filePath => {
  const content = await fs.readFile(filePath, 'utf-8')
  const fileInfo = await parseFile(content, filePath)
  const exports = extractExports(fileInfo)
  const result = []
  const sourceDir = path.dirname(filePath)
  for (const exp of exports) {
    if (exp.isBatch && exp.source?.endsWith('.svelte')) {
      // export * from './foo.svelte' - extract default name
      const svelteDefaultName = path.basename(exp.source, '.svelte')
      result.push({
        name: svelteDefaultName,
        path: path.resolve(sourceDir, exp.source),
      })
    } else if (exp.source?.endsWith('.svelte')) {
      // export { x } from './foo.svelte'
      const resolvedPath = path.resolve(sourceDir, exp.source)
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
//# sourceMappingURL=getSvelteExports.js.map
