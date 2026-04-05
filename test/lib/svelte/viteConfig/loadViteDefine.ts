import path from 'node:path'
import { fs } from '@magic/fs'
import { loadViteDefine } from '../../src/lib/svelte/viteConfig/loadViteDefine.js'
import { defineCache, configCache } from '../../src/lib/svelte/viteConfig/cache.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'loadViteDefine')
const CONFIG_PATH = path.join(TEST_ROOT, 'vite.config.js')

export default {
  beforeAll: async () => {
    defineCache.clear()
    configCache.clear()
    await fs.mkdir(TEST_ROOT, { recursive: true })

    return async () => {
      await fs.rmrf(TEST_ROOT)
    }
  },
  tests: [
    {
      fn: async () => {
        // No config file
        const result = await loadViteDefine(TEST_ROOT)
        return result
      },
      expect: {},
      info: 'returns {} when no config file exists',
    },
    {
      fn: async () => {
        // Valid define
        await fs.writeFile(
          CONFIG_PATH,
          `
          export default defineConfig({
            define: { __VITE_PROD__: false }
          })
        `,
        )
        const result = await loadViteDefine(TEST_ROOT)
        return result
      },
      expect: { __VITE_PROD__: false },
      info: 'loads define from config',
    },
    {
      fn: async () => {
        // Config with parse error (invalid syntax)
        await fs.writeFile(CONFIG_PATH, `invalid syntax`)
        const result = await loadViteDefine(TEST_ROOT)
        return result
      },
      expect: {},
      info: 'catches parse errors and returns {}',
    },
    {
      fn: async () => {
        // Cache hit
        defineCache.set(TEST_ROOT + ':vite-define', { __VITE_PROD__: true })
        const result = await loadViteDefine(TEST_ROOT)
        return result
      },
      expect: { __VITE_PROD__: true },
      info: 'returns cached result without parsing config',
    },
  ],
}
