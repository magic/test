import { CacheManager } from '../../../../src/lib/svelte/compile/cache.js'
import type { TestCase } from '../../../../src/types.d.js'

// TestCache for generic type
interface TestCache {
  js: string
  css: string | null
}

// Helper to access private methods for testing
function getPrivate<T>(cm: CacheManager<T>): {
  memoryCache: Map<string, unknown>
  pendingCompiles: Map<string, unknown>
  isSvelteResult: (result: unknown) => boolean
} {
  // Use type assertion to access private members for testing
  const privateCm = cm as unknown as {
    memoryCache: Map<string, unknown>
    pendingCompiles: Map<string, unknown>
    isSvelteResult: (result: unknown) => boolean
  }
  return privateCm
}

export default [
  // getStats starts at zero
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const stats = cm.getStats()
      return stats.hits === 0 && stats.misses === 0 && stats.hitRate === '0.0'
    },
    expect: true,
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
      return stats.misses === 0 && stats.hits === 0
    },
    expect: true,
    info: 'reset clears hits and misses',
  },
  // isSvelteResult type guard - valid result
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return priv.isSvelteResult({ js: 'code' })
    },
    expect: true,
    info: 'isSvelteResult returns true for { js }',
  },
  // isSvelteResult type guard - valid result with css
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return priv.isSvelteResult({ js: 'code', css: '.style {}' })
    },
    expect: true,
    info: 'isSvelteResult returns true for { js, css }',
  },
  // isSvelteResult type guard - missing js
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return !priv.isSvelteResult({ css: 'style' })
    },
    expect: true,
    info: 'isSvelteResult returns false without js',
  },
  // isSvelteResult type guard - null
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return !priv.isSvelteResult(null)
    },
    expect: true,
    info: 'isSvelteResult returns false for null',
  },
  // isSvelteResult type guard - undefined
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return !priv.isSvelteResult(undefined)
    },
    expect: true,
    info: 'isSvelteResult returns false for undefined',
  },
  // isSvelteResult type guard - array
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return !priv.isSvelteResult(['code'])
    },
    expect: true,
    info: 'isSvelteResult returns false for array',
  },
  // isSvelteResult type guard - string
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return !priv.isSvelteResult('not an object')
    },
    expect: true,
    info: 'isSvelteResult returns false for string',
  },
  // memoryCache starts empty
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return priv.memoryCache.size === 0
    },
    expect: true,
    info: 'memoryCache is initially empty',
  },
  // pendingCompiles starts empty
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const priv = getPrivate(cm)
      return priv.pendingCompiles.size === 0
    },
    expect: true,
    info: 'pendingCompiles is initially empty',
  },
  // hit rate calculation
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      cm.hits = 3
      cm.misses = 1
      const stats = cm.getStats()
      return stats.hitRate === '75.0'
    },
    expect: true,
    info: 'hitRate calculates correctly as percentage',
  },
  // hit rate with no requests
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      const stats = cm.getStats()
      return stats.hitRate === '0.0'
    },
    expect: true,
    info: 'hitRate is 0.0 when no requests',
  },
  // multiple resets are idempotent
  {
    fn: () => {
      const cm = new CacheManager<TestCache>()
      cm.misses = 10
      cm.reset()
      cm.reset()
      return cm.getStats().misses === 0
    },
    expect: true,
    info: 'multiple resets work correctly',
  },
  // generic CacheManager with different type
  {
    fn: () => {
      const cm = new CacheManager<{ value: number }>()
      const stats = cm.getStats()
      return stats.hits === 0
    },
    expect: true,
    info: 'CacheManager works with different generic types',
  },
] satisfies TestCase[]
