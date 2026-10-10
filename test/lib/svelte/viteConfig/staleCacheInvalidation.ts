import path from 'node:path'
import { fs } from '@magic/fs'
import { CACHE_DIR } from '#src/constants.js'
import { loadViteAliases } from '#lib/svelte/viteConfig/loadViteAliases.js'
import { loadViteConfig } from '#lib/svelte/viteConfig/loadViteConfig.js'
import { configCache, aliasCache } from '#lib/svelte/viteConfig/cache.js'

// Regression: these caches keep per-thread state — the ESM loader runs in
// its own thread with its own module instances. A "no aliases" result
// cached while no vite.config.js exists must be invalidated when a config
// appears (and vice versa), because clearing the main-thread caches does
// not reach the loader thread. Entries are validated against mtime + size.
//
// Each test drives the cache through its own fixture root (private, no
// cwd-level vite.config.js), so the suite is deterministic under parallel
// execution.

const BASE = path.join(CACHE_DIR, 'viteConfig', 'staleCacheInvalidation')
const makeRoot = (name: string) => path.join(BASE, name)
const configIn = (root: string) => path.join(root, 'vite.config.js')

// Small delay so consecutive writes get distinct mtimes (fs tick granularity)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  beforeAll: async () => {
    await configCache.clear()
    await aliasCache.clear()
    await fs.mkdirp(BASE)
  },
  afterAll: async () => {
    await fs.rmrf(BASE)
    await configCache.clear()
    await aliasCache.clear()
  },
  tests: [
    {
      fn: async () => {
        const root = makeRoot('negative')
        await fs.mkdirp(root)
        await configCache.clear()
        await aliasCache.clear()

        // Negative lookup, then a config appears — the stale "no aliases"
        // state must be invalidated.
        const before = await loadViteAliases(root)
        await fs.writeFile(
          configIn(root),
          `export default { resolve: { alias: { find: '$sc', replacement: '/a' } } }`,
        )
        const after = await loadViteAliases(root)

        return [before.length === 0, after]
      },
      expect: [true, [{ find: '$sc', replacement: '/a' }]],
      info: 'stale negative cache invalidated when config appears',
    },
    {
      fn: async () => {
        const root = makeRoot('positive-change')
        await fs.mkdirp(root)
        await configCache.clear()
        await aliasCache.clear()
        await fs.writeFile(
          configIn(root),
          `export default { resolve: { alias: { find: '$sc', replacement: '/a' } } }`,
        )
        const first = await loadViteAliases(root)

        // Config content changes — the cached aliases must be reloaded.
        await sleep(25)
        await fs.writeFile(
          configIn(root),
          `export default { resolve: { alias: { find: '$sc2', replacement: '/b' } } }`,
        )
        const second = await loadViteAliases(root)

        return [first, second]
      },
      expect: [[{ find: '$sc', replacement: '/a' }], [{ find: '$sc2', replacement: '/b' }]],
      info: 'stale positive cache invalidated when config changes',
    },
    {
      fn: async () => {
        const root = makeRoot('positive-delete')
        await fs.mkdirp(root)
        await configCache.clear()
        await aliasCache.clear()
        await fs.writeFile(
          configIn(root),
          `export default { resolve: { alias: { find: '$sc', replacement: '/a' } } }`,
        )
        const first = await loadViteAliases(root)

        // Config deleted — back to no aliases. The second lookup must hit
        // the (now negative) cached state.
        await sleep(25)
        await fs.rmrf(configIn(root))
        const second = await loadViteAliases(root)
        const third = await loadViteAliases(root)

        return [first, second.length === 0, third.length === 0]
      },
      expect: [[{ find: '$sc', replacement: '/a' }], true, true],
      info: 'stale positive cache invalidated when config is deleted',
    },
    {
      fn: async () => {
        const root = makeRoot('load-config-change')
        await fs.mkdirp(root)
        await configCache.clear()
        await aliasCache.clear()
        await fs.writeFile(configIn(root), `export default { define: { MODE: '"one"' } }`)
        const first = (await loadViteConfig(root)).define

        // loadViteConfig: same invalidation for the full-config cache.
        await sleep(25)
        await fs.writeFile(configIn(root), `export default { define: { MODE: '"two"' } }`)
        const second = (await loadViteConfig(root)).define

        return [first?.MODE, second?.MODE]
      },
      expect: ['"one"', '"two"'],
      info: 'loadViteConfig reloads when the config changes',
    },
  ],
}
