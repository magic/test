import path from 'node:path'
import fs from '@magic/fs'
import { barrelCache } from './cache.js'
export const getSvelteExports = async filePath => {
  const cached = barrelCache.get(filePath)
  if (cached) {
    return cached.exports
  }
  const content = await fs.readFile(filePath, 'utf-8')
  const exports = []
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
