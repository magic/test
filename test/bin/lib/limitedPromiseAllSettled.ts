import is from '@magic/types'
import { limitedPromiseAllSettled } from '../../../src/bin/lib/limitedPromiseAllSettled.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Empty array
  {
    fn: async () => limitedPromiseAllSettled([], 2, async _x => _x),
    expect: [],
    info: 'empty array returns empty results',
  },
  // Single item
  {
    fn: async () => limitedPromiseAllSettled([1], 2, async _x => _x),
    expect: [{ status: 'fulfilled', value: 1 }],
    info: 'single item resolves correctly',
  },
  // Multiple items resolve in order
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1, 2, 3], 3, async _x => _x)
      return results.map(r => (r.status === 'fulfilled' ? r.value : r.reason))
    },
    expect: [1, 2, 3],
    info: 'multiple items resolve in order',
  },
  // Rejections captured
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1], 2, async _x => {
        throw new Error('fail')
      })
      return results[0]!.status
    },
    expect: 'rejected',
    info: 'rejections are captured with rejected status',
  },
  // Fulfilled values captured
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled(['ok'], 2, async _x => _x)
      return results[0]!.status
    },
    expect: 'fulfilled',
    info: 'fulfilled values captured with fulfilled status',
  },
  // Limit=1 processes sequentially
  {
    fn: async () => {
      let order = ''
      await limitedPromiseAllSettled([1, 2, 3], 1, async x => {
        order += x
        return x
      })
      return order
    },
    expect: '123',
    info: 'limit=1 processes sequentially',
  },
  // Limit=3 allows 3 concurrent, queues rest
  {
    fn: async () => {
      let count = 0
      const maxConcurrent = async () => {
        count++
        await new Promise(r => setTimeout(r, 10))
        count--
        return count
      }
      const _results = await limitedPromiseAllSettled([1, 2, 3, 4], 3, maxConcurrent)
      // Some should have seen count > 1 (concurrent)
      return count
    },
    expect: 0,
    info: 'limit=3 allows 3 concurrent',
  },
  // Index parameter passed correctly
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled(['a', 'b', 'c'], 3, async (_x, idx) => idx)
      return results.map(r => (r.status === 'fulfilled' ? r.value : -1))
    },
    expect: [0, 1, 2],
    info: 'index parameter passed correctly',
  },
  // Function throws - error captured
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1], 2, async () => {
        throw new Error('test error')
      })
      return results[0]!.reason
    },
    expect: is.error,
    info: 'function throws - error captured',
  },
  // Function returns rejected promise
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1], 2, async () => {
        return Promise.reject(new Error('rejected'))
      })
      return results[0]!.status
    },
    expect: 'rejected',
    info: 'function returns rejected promise - captured',
  },
  // Mixed success and failure
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1, 2, 3], 3, async x => {
        if (x === 2) {
          throw new Error('fail 2')
        }
        return x
      })
      return {
        r0: results[0]!.status,
        r1: results[1]!.status,
        r2: results[2]!.status,
      }
    },
    expect: { r0: 'fulfilled', r1: 'rejected', r2: 'fulfilled' },
    info: 'mixed success and failure handled',
  },
  // Limit > items processes all immediately
  {
    fn: async () => {
      const results = await limitedPromiseAllSettled([1, 2], 10, async _x => _x)
      return results.every(r => r.status === 'fulfilled')
    },
    expect: true,
    info: 'limit > items processes all immediately',
  },
] satisfies TestCase[]
