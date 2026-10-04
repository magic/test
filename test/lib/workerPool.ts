import { getWorkerPool, getEffectiveWorkerLimit } from '#src/lib/workerPool.js'
import type { TestCase } from '#src/types.js'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const tests: TestCase[] = [
  // override parameter
  {
    fn: () => getEffectiveWorkerLimit(3),
    expect: 3,
    info: 'override value returned as-is',
  },
  {
    fn: () => getEffectiveWorkerLimit(0),
    expect: 1,
    info: 'override 0 clamped to 1',
  },
  {
    fn: () => getEffectiveWorkerLimit(-5),
    expect: 1,
    info: 'negative override clamped to 1',
  },
  {
    fn: () => getEffectiveWorkerLimit(100),
    expect: 100,
    info: 'large override returned as-is',
  },
  // env var parsing
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = '4'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) delete process.env.MAGIC_TEST_WORKERS
      else process.env.MAGIC_TEST_WORKERS = original
      return result === 4
    },
    expect: true,
    info: 'MAGIC_TEST_WORKERS env var honored',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = 'abc'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) delete process.env.MAGIC_TEST_WORKERS
      else process.env.MAGIC_TEST_WORKERS = original
      // falls back to availableParallelism - 2
      return result >= 1
    },
    expect: true,
    info: 'invalid env var falls back to parallelism',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = '0'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) delete process.env.MAGIC_TEST_WORKERS
      else process.env.MAGIC_TEST_WORKERS = original
      return result >= 1
    },
    expect: true,
    info: 'env var 0 clamped to at least 1',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      delete process.env.MAGIC_TEST_WORKERS
      const result = getEffectiveWorkerLimit()
      if (original !== undefined) process.env.MAGIC_TEST_WORKERS = original
      return result >= 1
    },
    expect: true,
    info: 'no env var falls back to parallelism',
  },
  // pool queues tasks beyond the limit
  {
    fn: async () => {
      const pool = getWorkerPool(1)
      let maxConcurrent = 0
      let concurrent = 0
      const tasks = [1, 2, 3, 4, 5].map(n =>
        pool(async () => {
          concurrent++
          maxConcurrent = Math.max(maxConcurrent, concurrent)
          await sleep(15)
          concurrent--
          return n
        }),
      )
      const results = await Promise.all(tasks)
      return maxConcurrent === 1 && JSON.stringify(results) === JSON.stringify([1, 2, 3, 4, 5])
    },
    expect: true,
    info: 'pool with limit 1 serializes tasks in order',
  },
  // pool releases slots on task completion
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      const order: number[] = []
      const start = Date.now()
      const t1 = pool(async () => {
        order.push(1)
        await sleep(30)
        order.push(4)
      })
      const t2 = pool(async () => {
        order.push(2)
        await sleep(5)
        order.push(3)
      })
      const t3 = pool(async () => {
        order.push(5)
      })
      await Promise.all([t1, t2, t3])
      // t3 must start after t2 finishes (limit 2)
      return order[0] === 1 && order[1] === 2 && order[2] === 3 && order[3] === 5
    },
    expect: true,
    info: 'queued task starts when a slot frees up',
  },
  // pool propagates errors and releases slot
  {
    fn: async () => {
      const pool = getWorkerPool(1)
      let caught = false
      try {
        await pool(async () => {
          throw new Error('pool error')
        })
      } catch {
        caught = true
      }
      // pool should still accept work after error
      const next = await pool(async () => 'recovered')
      return caught && next === 'recovered'
    },
    expect: true,
    info: 'pool releases slot after task error',
  },
  // default limit from getWorkerPool() (no arg)
  {
    fn: async () => {
      const pool = getWorkerPool()
      const r = await pool(async () => 'ok')
      return r === 'ok'
    },
    expect: true,
    info: 'getWorkerPool() without limit works',
  },
]

export default tests
