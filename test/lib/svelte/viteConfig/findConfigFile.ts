import path from 'node:path'
import { fs } from '@magic/fs'
import { findConfigFile } from '../../src/lib/svelte/viteConfig/findConfigFile.js'
import { VITE_CONFIG_NAMES } from '../../src/lib/svelte/viteConfig/VITE_CONFIG_NAMES.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'findConfigFile')

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
        await fs.writeFile(path.join(TEST_ROOT, 'vite.config.js'), '')
        const result = await findConfigFile(TEST_ROOT, VITE_CONFIG_NAMES)
        return result
      },
      expect: path.join(TEST_ROOT, 'vite.config.js'),
      info: 'finds config on first name',
    },
    {
      fn: async () => {
        await fs.writeFile(path.join(TEST_ROOT, 'vite.config.ts'), '')
        const result = await findConfigFile(TEST_ROOT, VITE_CONFIG_NAMES)
        return result
      },
      expect: path.join(TEST_ROOT, 'vite.config.ts'),
      info: 'finds config on second name',
    },
    {
      fn: async () => {
        const result = await findConfigFile(TEST_ROOT, VITE_CONFIG_NAMES)
        return result
      },
      expect: null,
      info: 'returns null when no config found',
    },
  ],
}
