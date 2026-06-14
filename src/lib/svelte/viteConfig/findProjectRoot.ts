import fs from '@magic/fs'
import path from 'node:path'

export const findProjectRoot = async (sourceDir: string): Promise<string> => {
  const root = process.cwd()

  if (sourceDir.includes('node_modules')) {
    return root
  }

  let current = sourceDir

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
