import { LRUCache } from '#lib/caches/LRUCache.js'
import { has } from '#lib/has.js'

export default [
  {
    fn: () => {
      const cache = new LRUCache(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      return { size: cache.size, a: cache.get('a'), b: cache.get('b') }
    },
    expect: has.properties({ size: 2, a: undefined, b: 2 }),
    info: 'evicts oldest entry when maxSize reached',
  },
  {
    fn: () => {
      const cache = new LRUCache(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 3)
      cache.set('c', 4)
      return { a: cache.get('a'), b: cache.get('b'), size: cache.size }
    },
    expect: has.properties({ a: 3, b: 2, size: 3 }),
    info: 'updates existing key and does not evict, updates access order',
  },
  {
    fn: () => {
      const cache = new LRUCache()
      cache.set('a', 1)
      return cache.size
    },
    expect: 1,
    info: 'size returns correct count',
  },
  {
    fn: () => {
      const cache = new LRUCache()
      cache.set('a', 1)
      cache.clear()
      return { size: cache.size, a: cache.get('a') }
    },
    expect: has.properties({ size: 0, a: undefined }),
    info: 'clear removes all entries',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      cache.set('a', 1)
      return { a: cache.has('a'), b: cache.has('b') }
    },
    expect: has.properties({ a: true, b: false }),
    info: 'has returns correct boolean',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      cache.set('a', 1)
      return { deleted: cache.delete('a'), has: cache.has('a') }
    },
    expect: has.properties({ deleted: true, has: false }),
    info: 'delete removes entry and returns true',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      return cache.delete('nonexistent')
    },
    expect: false,
    info: 'delete returns false for missing key',
  },
  {
    fn: () => {
      const cache = new LRUCache<string>(2)
      cache.set('a', 'first')
      cache.set('b', 'second')
      // Access 'a' to make it recently used
      cache.get('a')
      cache.set('c', 'third')
      // Should evict 'b' (oldest), not 'a'
      return { a: cache.get('a'), b: cache.get('b') }
    },
    expect: has.properties({ a: 'first', b: undefined }),
    info: 'get() updates access order (move to end)',
  },
  {
    fn: () => {
      const cache = new LRUCache<string>(2)
      cache.set('a', undefined as unknown as string)
      cache.set('b', null as unknown as string)
      cache.set('c', 'test')
      return { size: cache.size, c: cache.get('c'), a: cache.get('a') }
    },
    expect: has.properties({ size: 2, c: 'test', a: undefined }),
    info: 'handles undefined/null values without confusing cache hits',
  },
]
