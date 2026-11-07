/**
 * Wrap a promise with a timeout using Promise.race.
 * The timeout timer is always cleared once the race settles, so completed
 * tests do not leave pending timers that delay process exit.
 */
export const withTimeout = (promise, timeoutMs, testKey) => {
  if (!timeoutMs || timeoutMs <= 0 || Number.isNaN(timeoutMs)) {
    return promise
  }
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`)),
      timeoutMs,
    )
  })
  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer)
  })
}
//# sourceMappingURL=withTimeout.js.map
