import { getEffectiveWorkerLimit } from './getEffectiveWorkerLimit.js'
export const WORKER_LIMIT = getEffectiveWorkerLimit()
export const getWorkerPool = () => {
  const limit = getEffectiveWorkerLimit()
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
