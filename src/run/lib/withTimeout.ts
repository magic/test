/**
 * Wrap a promise with a timeout using Promise.race.
 * The timeout timer is always cleared once the race settles, so completed
 * tests do not leave pending timers that delay process exit.
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  testKey: string,
): Promise<T> => {
  if (!timeoutMs || timeoutMs <= 0 || Number.isNaN(timeoutMs)) {
    return promise
  }

  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`)),
      timeoutMs,
    )
  })

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer)
  })
}
