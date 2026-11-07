/**
 * Wrap a promise with a timeout using Promise.race.
 * The timeout timer is always cleared once the race settles, so completed
 * tests do not leave pending timers that delay process exit.
 */
export declare const withTimeout: <T>(
  promise: Promise<T>,
  timeoutMs: number,
  testKey: string,
) => Promise<T>
