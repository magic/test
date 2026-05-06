import { getEffectiveWorkerLimit } from './getEffectiveWorkerLimit.ts'

export const WORKER_LIMIT = getEffectiveWorkerLimit()

export const getWorkerPool = () => {
  const limit = getEffectiveWorkerLimit()

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
