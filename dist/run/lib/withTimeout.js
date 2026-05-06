/**
 * Wrap a promise with a timeout
 */
export const withTimeout = (promise, timeoutMs, testKey) => {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`))
    }, timeoutMs)
    promise
      .then(result => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch(err => {
        clearTimeout(timer)
        reject(err)
      })
  })
}
