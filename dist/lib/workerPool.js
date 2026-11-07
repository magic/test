import os from 'node:os'
const MAX_QUEUE_SIZE = 1000
const getEffectiveLimit = override => {
  if (override !== undefined) {
    return Math.max(1, override)
  }
  const envLimit = process.env.MAGIC_TEST_WORKERS
  if (envLimit) {
    const parsed = Number(envLimit)
    if (!Number.isNaN(parsed)) {
      return Math.max(1, Math.floor(parsed))
    }
  }
  return Math.max(1, os.availableParallelism() - 2)
}
export const WORKER_LIMIT = getEffectiveLimit()
export const getEffectiveWorkerLimit = getEffectiveLimit
let sharedPool = null
/**
 * Get a worker pool.
 *
 * Pools requested without an explicit limit share one process-wide pool, so
 * concurrently-running suites cannot multiply the worker count
 * (N suites × limit). Explicit limits get a dedicated pool.
 */
export const getWorkerPool = limit => {
  if (limit === undefined) {
    sharedPool ??= createWorkerPool(getEffectiveLimit())
    return sharedPool
  }
  return createWorkerPool(getEffectiveLimit(limit))
}
const createWorkerPool = limit => {
  let running = 0
  const waitQueue = []
  const release = () => {
    running--
    const next = waitQueue.shift()
    if (next) {
      next()
    }
  }
  return async function run(fn) {
    if (running < limit) {
      running++
      return fn().finally(release)
    }
    // Reject if queue is full to prevent unbounded memory growth
    if (waitQueue.length >= MAX_QUEUE_SIZE) {
      return Promise.reject(new Error(`Worker pool queue full (${MAX_QUEUE_SIZE} pending tasks)`))
    }
    return new Promise(resolve => {
      waitQueue.push(() => {
        running++
        resolve(fn().finally(release))
      })
    })
  }
}
//# sourceMappingURL=workerPool.js.map
