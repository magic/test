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
    if (!match[1] || !match[2]) continue
    const exportedNames = match[1].split(',').map(s => s.trim())
    const exportPath = match[2]
    const resolvedPath = path.resolve(sourceDir, exportPath)
    if (await fs.exists(resolvedPath)) {
      for (const name of exportedNames) {
        exports.push({ name, path: resolvedPath })
      }
    } else if (await fs.exists(resolvedPath + '.js')) {
      for (const name of exportedNames) {
        exports.push({ name, path: resolvedPath + '.js' })
      }
    }
  }
  return exports
}
