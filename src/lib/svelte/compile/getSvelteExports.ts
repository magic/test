import path from 'node:path'
import fs from '@magic/fs'

import { pendingPromises } from './cache.ts'
import { traceStart, traceEnd } from './timing.ts'

export type SvelteExport = { name: string; path: string; isDefaultReexport?: boolean }

// Simple barrel exports cache (stores exports array)
const barrelExportsCache = new Map<string, SvelteExport[]>()

export const getSvelteExports = async (filePath: string): Promise<SvelteExport[]> => {
  const id = traceStart(`getSvelteExports ${path.basename(filePath)}`)
  const key = `exports:${filePath}`

  // Check barrelExportsCache first
  const cached = barrelExportsCache.get(filePath)
  if (cached) {
    traceEnd(id, 'cache hit')
    return cached
  }

  // Check if already getting exports for this file
  const existing = pendingPromises.get(key)
  if (existing) {
    traceEnd(id, 'waiting for pending')
    return existing as Promise<SvelteExport[]>
  }

  const promise = (async (): Promise<SvelteExport[]> => {
    try {
      return await getSvelteExportsImpl(filePath)
    } finally {
      pendingPromises.delete(key)
    }
  })()

  pendingPromises.set(key, promise)

  const exports = await promise

  // Cache the exports for future use
  barrelExportsCache.set(filePath, exports)

  traceEnd(id)
  return exports
}

const getSvelteExportsImpl = async (filePath: string): Promise<SvelteExport[]> => {
  const content = await fs.readFile(filePath, 'utf-8')

  const exports: SvelteExport[] = []

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
