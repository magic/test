import os from 'node:os'

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

    return new Promise<T>(resolve => {
      waitQueue.push(() => {
        running++
        resolve(fn().finally(release))
      })
    })
  }
}
