import path from 'node:path'
import fs from '@magic/fs'

import { loadViteAliases } from '../../../../src/lib/svelte/viteConfig/loadViteAliases.js'
import { aliasCache, configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'loadViteAliases')
const CONFIG_PATH = path.join(TEST_ROOT, 'vite.config.js')
const EXPECTED_REPLACEMENT = path.join(TEST_ROOT, 'src')

export default {
  beforeAll: async () => {
    aliasCache.clear()
    configCache.clear()
    await fs.mkdirp(TEST_ROOT)

    return async () => {
      await fs.rmrf(TEST_ROOT)
    }
  },
  tests: [
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        await fs.rmrf(TEST_ROOT)
        await fs.mkdir(TEST_ROOT, { recursive: true })
        // No config file
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: [],
      info: 'returns [] when no config file exists',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        await fs.rmrf(TEST_ROOT)
        await fs.mkdir(TEST_ROOT, { recursive: true })
        // Valid config
        await fs.writeFile(
          CONFIG_PATH,
          `
            export default defineConfig({
              resolve: { alias: { find: '@', replacement: './src' } }
            })
          `,
        )
        await fs.writeFile(
          CONFIG_PATH,
          `
            export default defineConfig({
              resolve: { alias: { find: '@', replacement: './src' } }
            })
          `,
        )
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: [{ find: '@', replacement: EXPECTED_REPLACEMENT }],
      info: 'loads and caches aliases from config',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        await fs.rmrf(TEST_ROOT)
        await fs.mkdir(TEST_ROOT, { recursive: true })
        // Config with parse error (invalid syntax)
        await fs.writeFile(CONFIG_PATH, `invalid syntax`)
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: [],
      info: 'catches parse errors and returns []',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        await fs.rmrf(TEST_ROOT)
        await fs.mkdir(TEST_ROOT, { recursive: true })
        // Cache hit: pre-populate cache
        aliasCache.set(TEST_ROOT + ':vite', [{ find: '$lib', replacement: '/root/src/lib' }])
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: [{ find: '$lib', replacement: '/root/src/lib' }],
      info: 'returns cached result without parsing config',
    },
  ],
}
