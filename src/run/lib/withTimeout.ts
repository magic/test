/**
 * Wrap a promise with a timeout using Promise.race
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  testKey: string,
): Promise<T> => {
  if (!timeoutMs || timeoutMs <= 0 || Number.isNaN(timeoutMs)) {
    return promise
  }

  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Test timed out after ${timeoutMs}ms: ${testKey}`)),
        timeoutMs,
      ),
    ),
  ])
}
