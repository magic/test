import fs from '@magic/fs'
import path from 'node:path'
export const findProjectRoot = async sourceDir => {
  let current = sourceDir
  const root = process.cwd()
  while (current && current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json')
    const exists = await fs.exists(pkgPath)
    if (exists) {
      return current
    }
    current = path.dirname(current)
  }
  return root
}
