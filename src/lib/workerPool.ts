import os from 'node:os'

const MAX_QUEUE_SIZE = 1000

const getEffectiveLimit = (override?: number): number => {
  if (override !== undefined) {
    return Math.max(1, override)
  }
  const envLimit = process.env.MAGIC_TEST_WORKERS
  if (envLimit) {
    const parsed = parseInt(envLimit, 10)
    if (!isNaN(parsed)) {
      return Math.max(1, parsed)
    }
  }
  return Math.max(1, os.availableParallelism() - 2)
}

export const WORKER_LIMIT = getEffectiveLimit()
export const getEffectiveWorkerLimit = getEffectiveLimit

export const getWorkerPool = (limit?: number) => {
  const effectiveLimit = getEffectiveLimit(limit)
  return createWorkerPool(effectiveLimit)
}

const createWorkerPool = (limit: number) => {
  let running = 0
  const waitQueue: Array<() => void> = []

  const release = () => {
    running--
    const next = waitQueue.shift()
    if (next) {
      next()
    }
  }

  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (running < limit) {
      running++
      return fn().finally(release)
    }

    // Reject if queue is full to prevent unbounded memory growth
    if (waitQueue.length >= MAX_QUEUE_SIZE) {
      return Promise.reject(new Error(`Worker pool queue full (${MAX_QUEUE_SIZE} pending tasks)`))
    }

    return new Promise<T>(resolve => {
      waitQueue.push(() => {
        running++
        resolve(fn().finally(release))
      })
    })
  }
}
