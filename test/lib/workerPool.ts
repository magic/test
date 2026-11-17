import {
  getWorkerPool,
  getEffectiveWorkerLimit,
  computeDefaultWorkerLimit,
  computeAdaptiveLimit,
  DEFAULT_WORKER_CAP,
  setLoadSampler,
  getSharedPoolLimitForTests,
  tickAdaptiveLimitForTests,
} from '#lib/workerPool.js'
import * as reexported from '#src/run/lib/getWorkerPool.js'
import { has } from '#lib/has.js'
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
      if (original === undefined) {
        delete process.env.MAGIC_TEST_WORKERS
      } else {
        process.env.MAGIC_TEST_WORKERS = original
      }
      return result
    },
    expect: 4,
    info: 'MAGIC_TEST_WORKERS env var honored',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = 'abc'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) {
        delete process.env.MAGIC_TEST_WORKERS
      } else {
        process.env.MAGIC_TEST_WORKERS = original
      }
      // falls back to availableParallelism - 2
      return result
    },
    expect: (v: number) => v >= 1,
    info: 'invalid env var falls back to parallelism',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = '0'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) {
        delete process.env.MAGIC_TEST_WORKERS
      } else {
        process.env.MAGIC_TEST_WORKERS = original
      }
      return result
    },
    expect: (v: number) => v >= 1,
    info: 'env var 0 clamped to at least 1',
  },
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      delete process.env.MAGIC_TEST_WORKERS
      const result = getEffectiveWorkerLimit()
      if (original !== undefined) {
        process.env.MAGIC_TEST_WORKERS = original
      }
      return result
    },
    expect: (v: number) => v >= 1,
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
      return { maxConcurrent, results }
    },
    expect: has.properties({ maxConcurrent: 1, results: [1, 2, 3, 4, 5] }),
    info: 'pool with limit 1 serializes tasks in order',
  },
  // pool releases slots on task completion
  {
    fn: async () => {
      const pool = getWorkerPool(2)
      const order: number[] = []
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
      return order.slice(0, 4)
    },
    expect: [1, 2, 3, 5],
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
      return { caught, next }
    },
    expect: has.properties({ caught: true, next: 'recovered' }),
    info: 'pool releases slot after task error',
  },
  // default limit from getWorkerPool() (no arg)
  {
    fn: async () => {
      const pool = getWorkerPool()
      const r = await pool(async () => 'ok')
      return r
    },
    expect: 'ok',
    info: 'getWorkerPool() without limit works',
  },
  // auto default is capped at DEFAULT_WORKER_CAP
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      delete process.env.MAGIC_TEST_WORKERS
      const result = getEffectiveWorkerLimit()
      if (original !== undefined) {
        process.env.MAGIC_TEST_WORKERS = original
      }
      return { result, capped: result >= 1 && result <= DEFAULT_WORKER_CAP }
    },
    expect: (v: { result: number; capped: boolean }) => v.capped,
    info: 'auto default is capped at DEFAULT_WORKER_CAP',
  },
  // explicit env var bypasses the cap
  {
    fn: async () => {
      const original = process.env.MAGIC_TEST_WORKERS
      process.env.MAGIC_TEST_WORKERS = '14'
      const result = getEffectiveWorkerLimit()
      if (original === undefined) {
        delete process.env.MAGIC_TEST_WORKERS
      } else {
        process.env.MAGIC_TEST_WORKERS = original
      }
      return result
    },
    expect: 14,
    info: 'explicit MAGIC_TEST_WORKERS bypasses the auto cap',
  },
  // computeDefaultWorkerLimit tiers
  {
    fn: () => [
      computeDefaultWorkerLimit(16),
      computeDefaultWorkerLimit(6),
      computeDefaultWorkerLimit(5),
      computeDefaultWorkerLimit(4),
      computeDefaultWorkerLimit(3),
      computeDefaultWorkerLimit(2),
      computeDefaultWorkerLimit(1),
    ],
    expect: [4, 4, 3, 2, 1, 1, 1],
    info: 'computeDefaultWorkerLimit caps cores-2 at the default worker cap',
  },
  // computeAdaptiveLimit tiers
  {
    fn: () => [
      computeAdaptiveLimit(14, 10, 16),
      computeAdaptiveLimit(14, 16, 16),
      computeAdaptiveLimit(14, 16.1, 16),
      computeAdaptiveLimit(14, 32, 16),
      computeAdaptiveLimit(14, 32.1, 16),
      computeAdaptiveLimit(14, 100, 16),
      computeAdaptiveLimit(2, 3, 2),
      computeAdaptiveLimit(1, 100, 16),
    ],
    expect: [14, 14, 7, 7, 1, 1, 1, 1],
    info: 'computeAdaptiveLimit: full at load<=cores, half up to 2x cores, 1 beyond',
  },
  // shared pool throttles under load and restores when it clears
  {
    fn: async () => {
      const origAdaptive = process.env.MAGIC_TEST_ADAPTIVE
      const origCi = process.env.CI
      delete process.env.MAGIC_TEST_ADAPTIVE
      delete process.env.CI
      setLoadSampler(() => 1000)
      try {
        getWorkerPool()
        tickAdaptiveLimitForTests()
        const throttled = getSharedPoolLimitForTests()
        setLoadSampler(() => 0)
        const restored = tickAdaptiveLimitForTests()
        const configured = getEffectiveWorkerLimit()
        return { throttled, restored, configured }
      } finally {
        setLoadSampler()
        if (origAdaptive === undefined) delete process.env.MAGIC_TEST_ADAPTIVE
        else process.env.MAGIC_TEST_ADAPTIVE = origAdaptive
        if (origCi === undefined) delete process.env.CI
        else process.env.CI = origCi
        tickAdaptiveLimitForTests()
      }
    },
    expect: (v: { throttled: number; restored: number; configured: number }) =>
      v.throttled === 1 && v.restored === v.configured,
    info: 'shared pool limit throttles to 1 under heavy load and restores when it clears',
  },
  // MAGIC_TEST_ADAPTIVE=0 disables the throttling
  {
    fn: async () => {
      const origAdaptive = process.env.MAGIC_TEST_ADAPTIVE
      const origCi = process.env.CI
      delete process.env.MAGIC_TEST_ADAPTIVE
      delete process.env.CI
      setLoadSampler(() => 0)
      try {
        // Establish a known pre-state (adaptive on, load cleared → limit at
        // the configured value): on a loaded machine an earlier tick with
        // the real load sampler can leave the pool pre-throttled, and the
        // assertion must hold in that case too.
        getWorkerPool()
        tickAdaptiveLimitForTests()
        process.env.MAGIC_TEST_ADAPTIVE = '0'
        setLoadSampler(() => 1000)
        const limit = tickAdaptiveLimitForTests()
        const configured = getEffectiveWorkerLimit()
        return { limit, configured }
      } finally {
        if (origAdaptive === undefined) delete process.env.MAGIC_TEST_ADAPTIVE
        else process.env.MAGIC_TEST_ADAPTIVE = origAdaptive
        if (origCi === undefined) delete process.env.CI
        else process.env.CI = origCi
        setLoadSampler()
        tickAdaptiveLimitForTests()
      }
    },
    expect: (v: { limit: number; configured: number }) => v.limit === v.configured,
    info: 'MAGIC_TEST_ADAPTIVE=0 disables load-adaptive throttling',
  },
  // shared pool limit transitions under load
  {
    fn: async () => {
      const origAdaptive = process.env.MAGIC_TEST_ADAPTIVE
      const origCi = process.env.CI
      delete process.env.MAGIC_TEST_ADAPTIVE
      delete process.env.CI
      setLoadSampler(() => 1000)
      try {
        const pool = getWorkerPool()
        const beforeThrottle = tickAdaptiveLimitForTests()
        setLoadSampler(() => 0)
        const afterClear = tickAdaptiveLimitForTests()
        const wakeIsFunction = typeof pool.wake === 'function'
        pool.wake()
        return { beforeThrottle, afterClear, wakeIsFunction, configured: getEffectiveWorkerLimit() }
      } finally {
        setLoadSampler()
        if (origAdaptive === undefined) delete process.env.MAGIC_TEST_ADAPTIVE
        else process.env.MAGIC_TEST_ADAPTIVE = origAdaptive
        if (origCi === undefined) delete process.env.CI
        else process.env.CI = origCi
        tickAdaptiveLimitForTests()
      }
    },
    expect: (v: {
      beforeThrottle: number
      afterClear: number
      wakeIsFunction: boolean
      configured: number
    }) => v.beforeThrottle === 1 && v.afterClear === v.configured && v.wakeIsFunction,
    info: 'shared pool limit transitions to 1 under load and back to the configured limit when it clears',
  },
  // re-export module identity
  {
    fn: () => {
      return {
        samePool: reexported.getWorkerPool === getWorkerPool,
        sameLimit: reexported.getEffectiveWorkerLimit === getEffectiveWorkerLimit,
        workerLimitIsPositiveNumber:
          typeof reexported.WORKER_LIMIT === 'number' && reexported.WORKER_LIMIT > 0,
      }
    },
    expect: (v: { samePool: boolean; sameLimit: boolean; workerLimitIsPositiveNumber: boolean }) =>
      v.samePool && v.sameLimit && v.workerLimitIsPositiveNumber,
    info: 'run/lib/getWorkerPool re-exports the same helpers as lib/workerPool',
  },
]

export default tests
