import path from 'node:path'
import { fs } from '@magic/fs'
import { findProjectRoot } from '../../src/lib/svelte/viteConfig/findProjectRoot.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'findProjectRoot')

export default {
  beforeAll: async () => {
    await fs.mkdir(TEST_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      fn: async () => {
        const subdir = path.join(TEST_ROOT, 'subdir')
        await fs.mkdir(subdir)
        await fs.writeFile(path.join(TEST_ROOT, 'package.json'), JSON.stringify({ name: 'test' }))
        const result = await findProjectRoot(subdir)
        return result
      },
      expect: TEST_ROOT,
      info: 'finds package.json in parent directory',
    },
    {
      fn: async () => {
        const deepDir = path.join(TEST_ROOT, 'a', 'b', 'c')
        await fs.mkdir(deepDir, { recursive: true })
        await fs.writeFile(path.join(TEST_ROOT, 'package.json'), JSON.stringify({ name: 'test' }))
        const result = await findProjectRoot(deepDir)
        return result
      },
      expect: TEST_ROOT,
      info: 'traverses up to root package.json',
    },
    {
      fn: async () => {
        const subdir = path.join(TEST_ROOT, 'nomatch')
        await fs.mkdir(subdir)
        const result = await findProjectRoot(subdir)
        return result
      },
      expect: process.cwd(),
      info: 'falls back to process.cwd() when no package.json found',
    },
  ],
}
