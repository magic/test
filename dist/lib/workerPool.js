import os from 'node:os'
const getEffectiveLimit = override => {
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
export const getWorkerPool = limit => {
  const effectiveLimit = getEffectiveLimit(limit)
  return createWorkerPool(effectiveLimit)
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
    return new Promise(resolve => {
      waitQueue.push(() => {
        running++
        resolve(fn().finally(release))
      })
    })
  }
}
