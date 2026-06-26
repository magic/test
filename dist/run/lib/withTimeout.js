/**
 * Wrap a promise with a timeout using Promise.race
 */
export const withTimeout = (promise, timeoutMs, testKey) => {
  if (!timeoutMs || timeoutMs <= 0) {
    if (Number.isNaN(timeoutMs)) {
      throw new Error(`Invalid timeout value: ${timeoutMs}`)
    }
    return promise
  }
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`)),
        timeoutMs,
      ),
    ),
  ])
}
