import path from 'node:path'
import fs from '@magic/fs'

import { barrelCache } from './cache.ts'

export const getSvelteExports = async (
  filePath: string,
): Promise<{ name: string; path: string }[]> => {
  const cached = barrelCache.get(filePath)
  if (cached) {
    return cached.exports
  }

  const content = await fs.readFile(filePath, 'utf-8')

  const exports: { name: string; path: string }[] = []

  const regex = /export\s+\{([^}]+)\}\s+from\s+['"](\.\/[^'"]+\.svelte)['"]/g
  let match

  const sourceDir = path.dirname(filePath)

  while ((match = regex.exec(content)) !== null) {
    const exportedNames = match[1].split(',').map(s => s.trim())
    const exportPath = match[2]
    let resolvedPath = path.resolve(sourceDir, exportPath)

    if (await fs.exists(resolvedPath)) {
      for (const name of exportedNames) {
        exports.push({ name, path: resolvedPath })
      }
    }
  }

  return exports
}
