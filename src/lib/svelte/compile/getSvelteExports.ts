import path from 'node:path'
import fs from '@magic/fs'

import { barrelCache, pendingPromises } from '../../caches/cache.ts'
import { traceStart, traceEnd } from '../../trace/timing.ts'

export const getSvelteExports = async (
  filePath: string,
): Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]> => {
  const id = traceStart(`getSvelteExports ${path.basename(filePath)}`)

  // Check if another process is already getting exports for this file
  const pending = pendingPromises.get(`exports:${filePath}`) as
    | Promise<{ name: string; path: string; isDefaultReexport?: boolean }[]>
    | undefined
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

  const exports: { name: string; path: string; isDefaultReexport?: boolean }[] = []

  const regex = /export\s+\{([^}]+)\}\s+from\s+['"](\.\/[^'"]+\.svelte)['"]/g
  let match

  const sourceDir = path.dirname(filePath)

  while ((match = regex.exec(content)) !== null) {
    if (!match[1] || !match[2]) {
      continue
    }

    const exportStatement = match[1].trim()
    const exportPath = match[2]
    const resolvedPath = path.resolve(sourceDir, exportPath)

    if (await fs.exists(resolvedPath)) {
      const exportedNames = exportStatement.split(',')
      for (const name of exportedNames) {
        const trimmed = name.trim()
        if (trimmed.startsWith('type ') || trimmed === '') {
          continue
        }
        if (trimmed.includes(' as ')) {
          const parts = trimmed.split(/\s+as\s+/)
          const lastPart = parts[parts.length - 1]
          const exportedName = lastPart?.trim() || trimmed
          const isDefaultReexport = parts[0]?.trim() === 'default'
          exports.push({
            name: exportedName,
            path: resolvedPath,
            isDefaultReexport: isDefaultReexport || undefined,
          })
        } else {
          exports.push({ name: trimmed, path: resolvedPath })
        }
      }
    }
  }

  return exports
}
