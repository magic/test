import { LRUCache } from '../../../src/lib/svelte/LRUCache.js'

export default [
  {
    fn: () => {
      const cache = new LRUCache(2)
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      return cache.get('a') === undefined && cache.get('b') === 2
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
      return cache.get('a') === 3 && cache.get('b') === 2
    },
    expect: true,
    info: 'updates existing key and does not evict',
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
]
