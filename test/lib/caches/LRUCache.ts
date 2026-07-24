import { LRUCache } from '../../../src/lib/caches/LRUCache.js'

export default [
  {
    fn: () => {
      const cache = new LRUCache(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      return cache.size === 2 && cache.get('a') === undefined && cache.get('b') === 2
    },
    expect: true,
    info: 'evicts oldest entry when maxSize reached',
  },
  {
    fn: () => {
      const cache = new LRUCache(3)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('a', 3)
      cache.set('c', 4)
      return cache.get('a') === 3 && cache.get('b') === 2 && cache.size === 3
    },
    expect: true,
    info: 'updates existing key and does not evict, updates access order',
  },
  {
    fn: () => {
      const cache = new LRUCache()
      cache.set('a', 1)
      return cache.size === 1
    },
    expect: true,
    info: 'size returns correct count',
  },
  {
    fn: () => {
      const cache = new LRUCache()
      cache.set('a', 1)
      cache.clear()
      return cache.size === 0 && cache.get('a') === undefined
    },
    expect: true,
    info: 'clear removes all entries',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      cache.set('a', 1)
      return cache.has('a') && !cache.has('b')
    },
    expect: true,
    info: 'has returns correct boolean',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      cache.set('a', 1)
      return cache.delete('a') && !cache.has('a')
    },
    expect: true,
    info: 'delete removes entry and returns true',
  },
  {
    fn: () => {
      const cache = new LRUCache(5)
      return cache.delete('nonexistent') === false
    },
    expect: true,
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
      return cache.get('a') === 'first' && cache.get('b') === undefined
    },
    expect: true,
    info: 'get() updates access order (move to end)',
  },
  {
    fn: () => {
      const cache = new LRUCache<string>(2)
      cache.set('a', undefined as unknown as string)
      cache.set('b', null as unknown as string)
      cache.set('c', 'test')
      return cache.size === 2 && cache.get('c') === 'test' && cache.get('a') === undefined
    },
    expect: true,
    info: 'handles undefined/null values without confusing cache hits',
  },
]
