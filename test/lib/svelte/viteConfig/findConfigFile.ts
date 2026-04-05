import path from 'node:path'
import fs from '@magic/fs'
import { findConfigFile } from '../../../../src/lib/svelte/viteConfig/findConfigFile.js'
import { VITE_CONFIG_NAMES } from '../../../../src/lib/svelte/viteConfig/VITE_CONFIG_NAMES.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'findConfigFile')

const run1Dir = path.join(TEST_ROOT, 'run1')
const run2Dir = path.join(TEST_ROOT, 'run2')
const run3Dir = path.join(TEST_ROOT, 'run3')

export default {
  beforeAll: async () => {
    await fs.mkdir(TEST_ROOT, { recursive: true })
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      before: async () => {
        await fs.mkdirp(run1Dir)
        await fs.writeFile(path.join(run1Dir, 'vite.config.js'), '')

        return async () => {
          await fs.rmrf(run1Dir)
        }
      },
      fn: async () => await findConfigFile(run1Dir, VITE_CONFIG_NAMES),
      expect: path.join(run1Dir, 'vite.config.js'),
      info: 'finds config on first name',
    },
    {
      before: async () => {
        await fs.mkdirp(run2Dir)
        await fs.writeFile(path.join(run2Dir, 'vite.config.ts'), '')

        return async () => {
          await fs.rmrf(run2Dir)
        }
      },
      fn: () => findConfigFile(run2Dir, VITE_CONFIG_NAMES),
      expect: path.join(run2Dir, 'vite.config.ts'),
      info: 'finds config on second name',
    },
    {
      fn: findConfigFile(run3Dir, VITE_CONFIG_NAMES),
      expect: null,
      info: 'returns null when no config found',
    },
  ],
}
