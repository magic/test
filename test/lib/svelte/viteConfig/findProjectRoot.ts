import path from 'node:path'
import { fs } from '@magic/fs'
import { findProjectRoot } from '../../../../src/lib/svelte/viteConfig/findProjectRoot.js'

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
        const testDir = path.join(TEST_ROOT, 'run1')
        await fs.mkdir(testDir, { recursive: true })
        const subdir = path.join(testDir, 'subdir')
        await fs.mkdir(subdir)
        await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const result = await findProjectRoot(subdir)
        const expected = testDir
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'finds package.json in parent directory',
    },
    {
      fn: async () => {
        const testDir = path.join(TEST_ROOT, 'run2')
        await fs.mkdir(testDir, { recursive: true })
        const deepDir = path.join(testDir, 'a', 'b', 'c')
        await fs.mkdir(deepDir, { recursive: true })
        await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({ name: 'test' }))
        const result = await findProjectRoot(deepDir)
        const expected = testDir
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'traverses up to root package.json',
    },
    {
      fn: async () => {
        const testDir = path.join(TEST_ROOT, 'run3')
        await fs.mkdir(testDir, { recursive: true })
        const subdir = path.join(testDir, 'nomatch')
        await fs.mkdir(subdir)
        const result = await findProjectRoot(subdir)
        const expected = process.cwd()
        if (result !== expected) throw new Error(`Expected ${expected}, got ${result}`)
        return true
      },
      expect: true,
      info: 'falls back to process.cwd() when no package.json found',
    },
  ],
}
