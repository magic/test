import path from 'node:path'
import { fs } from '@magic/fs'
import { loadViteDefine } from '../../../../src/lib/svelte/viteConfig/loadViteDefine.js'
import { defineCache, configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'loadViteDefine')

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
        await defineCache.clear()
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const result = await loadViteDefine(testDir)
        return result
      },
      expect: {},
      info: 'returns {} when no config file exists',
    },
    {
      fn: async () => {
        await defineCache.clear()
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(
          configPath,
          `
          export default defineConfig({
            define: { __VITE_PROD__: false }
          })
        `,
        )
        const result = await loadViteDefine(testDir)
        return result
      },
      expect: { __VITE_PROD__: false },
      info: 'loads define from config',
    },
    {
      fn: async () => {
        await defineCache.clear()
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        const configPath = path.join(testDir, 'vite.config.js')
        await fs.writeFile(configPath, `invalid syntax`)
        const result = await loadViteDefine(testDir)
        return result
      },
      expect: {},
      info: 'catches parse errors and returns {}',
    },
    {
      fn: async () => {
        await defineCache.clear()
        await configCache.clear()
        const testDir = path.join(
          TEST_ROOT,
          'run-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        )
        await fs.mkdir(testDir, { recursive: true })
        // Cache hit: pre-populate cache
        defineCache.set(testDir + ':vite-define', { __VITE_PROD__: true })
        const result = await loadViteDefine(testDir)
        return result
      },
      expect: { __VITE_PROD__: true },
      info: 'returns cached result without parsing config',
    },
  ],
}
