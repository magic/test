import path from 'node:path'
import fs from '@magic/fs'

import { loadViteAliases } from '../../../../src/lib/svelte/viteConfig/loadViteAliases.js'
import { aliasCache, configCache } from '../../../../src/lib/svelte/viteConfig/cache.js'
import is from '@magic/types'

const TEST_ROOT = path.join(process.cwd(), 'test', '.tmp', 'viteConfig', 'loadViteAliases')

export default {
  beforeAll: async () => {
    await aliasCache.clear()
    await configCache.clear()
    await fs.mkdirp(TEST_ROOT)
  },
  afterAll: async () => {
    await fs.rmrf(TEST_ROOT)
  },
  tests: [
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        // No config file
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: is.arr,
      info: 'returns [] when no config file exists',
    },
    {
      before:async () => {
        await aliasCache.clear()
        await configCache.clear()
      },
      fn: async () => {
        // No config file
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: is.len.eq(0),
      info: 'returns [] when no config file exists',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()

        // Valid config
        const configPath = path.join(TEST_ROOT, 'vite-' + Date.now() + '.config.js')
        await fs.writeFile(
          configPath,
          `
            export default defineConfig({
              resolve: { alias: { find: '@', replacement: './src' } }
            })
          `,
        )
        const result = await loadViteAliases(TEST_ROOT)
        return Array.isArray(result) && result.length === 1
      },
      expect: true,
      info: 'loads aliases from config',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()

        // Config with parse error (invalid syntax)
        const configPath = path.join(TEST_ROOT, 'vite-err-' + Date.now() + '.config.js')
        await fs.writeFile(configPath, `invalid syntax`)

        await new Promise(r => setTimeout(r, 10))

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

        // Cache hit: pre-populate cache
        const cacheKey = TEST_ROOT + ':vite'
        aliasCache.set(cacheKey, [{ find: '$lib', replacement: '/root/src/lib' }])
        const result = await loadViteAliases(TEST_ROOT)
        return result
      },
      expect: [{ find: '$lib', replacement: '/root/src/lib' }],
      info: 'returns cached result without parsing config',
    },
  ],
}