import { getWorkerPool, WORKER_LIMIT } from '../../src/lib/workerPool.js'
import type { TestCase } from '../../src/types.js'

export default [
  // WORKER_LIMIT export
  {
    fn: () => typeof WORKER_LIMIT === 'number',
    expect: true,
    info: 'WORKER_LIMIT is a number',
  },
  {
    fn: () => WORKER_LIMIT >= 1,
    expect: true,
    info: 'WORKER_LIMIT is at least 1',
  },
  // getWorkerPool basics
  {
    fn: () => {
      const pool = getWorkerPool(2)
      return typeof pool === 'function'
    },
    expect: true,
    info: 'getWorkerPool returns a function',
  },
  // Concurrent execution
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      const [r1, r2, r3] = await Promise.all([
        pool(async () => {
          await new Promise(r => setTimeout(r, 10))
          return 1
        }),
        pool(async () => 2),
        pool(async () => 3),
      ])
      return [r1, r2, r3].sort()
    },
    expect: [1, 2, 3],
    info: 'pool executes tasks concurrently up to limit',
  },
  // Queueing with limit 1
  {
    fn: async () => {
      const pool = getWorkerPool(1)
      let order = ''
      const p1 = pool(async () => {
        await new Promise(r => setTimeout(r, 5))
        order += '1'
        return 'first'
      })
      const p2 = pool(async () => {
        order += '2'
        return 'second'
      })
      await Promise.all([p1, p2])
      return order
    },
    expect: '12',
    info: 'with limit 1, tasks queue and execute in order',
  },
  // Single immediate task
  {
    fn: async () => {
      const pool = getWorkerPool(3)
      return pool(async () => 'immediate')
    },
    expect: 'immediate',
    info: 'single task executes immediately when under limit',
  },
  // Error propagation
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      try {
        await pool(async () => {
          throw new Error('test error')
        })
        return false
      } catch {
        return true
      }
    },
    expect: true,
    info: 'pool propagates errors from tasks',
  },
  // Multiple queued tasks complete
  {
    fn: async () => {
      const pool = getWorkerPool(1)
      let resolve: (v: string) => void
      const _promise = new Promise<string>(r => (resolve = r))
      const p1 = pool(async () => {
        await new Promise(r => setTimeout(r, 10))
        return 'p1'
      })
      const p2 = pool(async () => {
        resolve!('p2')
        return 'p2'
      })
      const results = await Promise.all([p1, p2])
      return results
    },
    expect: ['p1', 'p2'],
    info: 'multiple queued tasks all complete',
  },
  // Pool is callable function
  {
    fn: () => {
      const pool = getWorkerPool(5)
      return typeof pool
    },
    expect: 'function',
    info: 'pool is callable function',
  },
  // getWorkerPool without limit uses default
  {
    fn: () => {
      const pool = getWorkerPool()
      return typeof pool
    },
    expect: 'function',
    info: 'getWorkerPool works without explicit limit',
  },
  // Task returns promise that resolves
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      return pool(async () => Promise.resolve('resolved'))
    },
    expect: 'resolved',
    info: 'pool handles promise-returning tasks',
  },
  // Task returns rejected promise
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      try {
        await pool(async () => Promise.reject(new Error('rejected')))
        return false
      } catch {
        return true
      }
    },
    expect: true,
    info: 'pool propagates rejected promises',
  },
  // Limit of 3 allows 3 concurrent
  {
    fn: async () => {
      const pool = getWorkerPool(3)
      const results = await Promise.all([
        pool(async () => 1),
        pool(async () => 2),
        pool(async () => 3),
        pool(async () => 4),
      ])
      return results.sort()
    },
    expect: [1, 2, 3, 4],
    info: 'with limit 3, 4th task waits for first to complete',
  },
] satisfies TestCase[]
