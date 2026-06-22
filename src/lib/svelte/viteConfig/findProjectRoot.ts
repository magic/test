import fs from '@magic/fs'
import path from 'node:path'

import { LRUCache } from '../../caches/LRUCache.ts'

const projectRootCache = new LRUCache<string>(100)

export const findProjectRoot = async (sourceDir: string): Promise<string> => {
  const cached = projectRootCache.get(sourceDir)
  if (cached) {
    return cached
  }

  const root = process.cwd()

  if (sourceDir.includes('node_modules')) {
    return root
  }

  let current = sourceDir

  while (current && current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json')
    const exists = await fs.exists(pkgPath)
    if (exists) {
      projectRootCache.set(sourceDir, current)
      return current
    }
    current = path.dirname(current)
  }

  projectRootCache.set(sourceDir, root)
  return root
}
