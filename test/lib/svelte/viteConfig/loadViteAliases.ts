import path from 'node:path'
import fs from '@magic/fs'
import { CACHE_DIR } from '#src/constants.js'

import { loadViteAliases } from '#lib/svelte/viteConfig/loadViteAliases.js'
import { configCache, aliasCache } from '#lib/svelte/viteConfig/cache.js'
import is from '@magic/types'

// Each test uses its own fixture root so the suite is safe under parallel
// execution (no shared mutable state between tests).
const makeRoot = (name: string) => path.join(CACHE_DIR, 'viteConfig', 'loadViteAliases', name)

export default {
  beforeAll: async () => {
    await aliasCache.clear()
    await configCache.clear()
  },
  afterAll: async () => {
    await fs.rmrf(path.join(CACHE_DIR, 'viteConfig', 'loadViteAliases'))
    await aliasCache.clear()
    await configCache.clear()
  },
  tests: [
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const root = makeRoot('no-config')
        await fs.mkdirp(root)
        const result = await loadViteAliases(root)
        return is.array(result) && result.length === 0
      },
      expect: true,
      info: 'returns [] when no config file exists',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const root = makeRoot('valid-config')
        await fs.mkdirp(root)
        await fs.writeFile(
          path.join(root, 'vite.config.js'),
          `
            export default {
              resolve: { alias: { find: '@', replacement: './src' } }
            }
          `,
        )
        const result = await loadViteAliases(root)
        return is.array(result) && result.length === 1
      },
      expect: true,
      info: 'loads aliases from config',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const root = makeRoot('broken-config')
        await fs.mkdirp(root)
        await fs.writeFile(path.join(root, 'vite.config.js'), `invalid syntax`)

        await new Promise(r => setTimeout(r, 10))

        const result = await loadViteAliases(root)
        return result
      },
      expect: [],
      info: 'catches parse errors and returns []',
    },
    {
      fn: async () => {
        await aliasCache.clear()
        await configCache.clear()
        const root = makeRoot('cached')
        await fs.mkdirp(root)
        const configPath = path.join(root, 'vite.config.js')

        // Establish real state: a valid config exists and has been loaded
        // once (this also records the config's mtime for cache validation).
        await fs.writeFile(
          configPath,
          `
            export default {
              resolve: { alias: { find: '@', replacement: './src' } }
            }
          `,
        )
        const first = await loadViteAliases(root)
        if (!is.array(first) || first.length !== 1) {
          return false
        }

        // Plant a sentinel in the cache — a cache hit must return it without
        // re-parsing the (different) config on disk.
        aliasCache.set(root + ':vite', [{ find: '$sentinel', replacement: '/root/src/lib' }])
        const result = await loadViteAliases(root)
        return result
      },
      expect: [{ find: '$sentinel', replacement: '/root/src/lib' }],
      info: 'returns cached result without parsing config',
    },
  ],
}
