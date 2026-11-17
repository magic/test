import type { TestCase } from '#src/types.js'

import { mkdir, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { CacheManager, pendingPromises } from '#lib/caches/cache.js'
import { loadManifest, sweepStaleManifest } from '#lib/caches/persistentCache.js'
import { has } from '#lib/has.js'

// TestCache for generic type
interface TestCache {
  js: string
  css: string | null
}

// Helper to access private members for testing
function getPrivate<T>(cm: CacheManager<T>): {
  memoryCache: Map<string, unknown>
} {
  // Use type assertion to access private members for testing
  const privateCm = cm as unknown as {
    memoryCache: Map<string, unknown>
  }
  return privateCm
}

export default [
  // getStats starts at zero
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const stats = cm.getStats()
      return stats
    },
    expect: has.properties({ hits: 0, misses: 0, hitRate: '0.0' }),
    info: 'new CacheManager has zero stats',
  },
  // reset clears state
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      cm.misses = 5
      cm.hits = 3
      cm.reset()
      const stats = cm.getStats()
      return stats
    },
    expect: has.properties({ misses: 0, hits: 0 }),
    info: 'reset clears hits and misses',
  },
  // P0-3 regression: the persistent cache entry is owned SOLELY by the
  // compileFn (compileSvelteWithWrite records it, with the sourceMappingURL
  // line). getOrCompile must NOT record a second entry — the old double
  // record overwrote the persisted file with the bare result.js, stripping
  // the sourceMappingURL line and breaking V8 coverage remapping.
  {
    fn: async () => {
      const dir = path.join(os.tmpdir(), `magic-cmgr-${process.pid}-${Date.now()}`)
      await mkdir(dir, { recursive: true })
      const file = path.join(dir, 'SingleOwner.svelte')
      await writeFile(file, '<script>let a = 0</script>')
      let calls = 0
      try {
        const cm = new CacheManager<TestCache>()
        const result = await cm.getOrCompile(file, async () => {
          calls++
          return { js: 'compiled', css: null }
        })
        const m = await loadManifest()
        const recorded = m ? m.sources[file] !== undefined : false
        return { calls, recorded, js: result.js, cached: result.cacheStatus?.cached }
      } finally {
        await rm(dir, { recursive: true, force: true })
        // never leak a manifest entry into the shared cache (and dogfood the
        // stale sweep while at it)
        await sweepStaleManifest().catch(() => undefined)
      }
    },
    expect: has.properties({ calls: 1, recorded: false, js: 'compiled', cached: false }),
    info: 'getOrCompile does not write a persistent cache entry (compileFn is the single owner)',
  },
  // P0-3 regression: a second getOrCompile for the same file hits the
  // in-memory cache and does not re-invoke the compileFn (dedup + memo).
  {
    fn: async () => {
      const dir = path.join(os.tmpdir(), `magic-cmgr-${process.pid}-${Date.now()}`)
      await mkdir(dir, { recursive: true })
      const file = path.join(dir, 'Memoized.svelte')
      await writeFile(file, '<script>let a = 0</script>')
      let calls = 0
      try {
        const cm = new CacheManager<TestCache>()
        await cm.getOrCompile(file, async () => {
          calls++
          return { js: 'one', css: null }
        })
        const again = await cm.getOrCompile(file, async () => {
          calls++
          return { js: 'two', css: null }
        })
        return { calls, js: again.js, cached: again.cacheStatus?.cached }
      } finally {
        await rm(dir, { recursive: true, force: true })
        await sweepStaleManifest().catch(() => undefined)
      }
    },
    expect: has.properties({ calls: 1, js: 'one', cached: true }),
    info: 'second getOrCompile hits the memory cache without re-compiling',
  },
  // memoryCache starts empty
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return priv.memoryCache.size
    },
    expect: 0,
    info: 'memoryCache is initially empty',
  },
  // reset clears pending cmgr: entries from the shared pendingPromises map
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      pendingPromises.set('cmgr:/tmp/nonexistent-test-file', Promise.resolve(undefined))
      cm.reset()
      return pendingPromises.has('cmgr:/tmp/nonexistent-test-file')
    },
    expect: false,
    info: 'reset clears cmgr: entries from shared pendingPromises',
  },
  // hit rate calculation
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      cm.hits = 3
      cm.misses = 1
      const stats = cm.getStats()
      return stats.hitRate
    },
    expect: '75.0',
    info: 'hitRate calculates correctly as percentage',
  },
  // hit rate with no requests
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const stats = cm.getStats()
      return stats.hitRate
    },
    expect: '0.0',
    info: 'hitRate is 0.0 when no requests',
  },
  // multiple resets are idempotent
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      cm.misses = 10
      cm.reset()
      cm.reset()
      return cm.getStats().misses
    },
    expect: 0,
    info: 'multiple resets work correctly',
  },
  // generic CacheManager with different type
  {
    fn: () => {
      const cm = new CacheManager<{ value: number }>()
      const stats = cm.getStats()
      return stats.hits
    },
    expect: 0,
    info: 'CacheManager works with different generic types',
  },
] satisfies TestCase[]
