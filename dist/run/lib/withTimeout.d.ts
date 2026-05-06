/**
 * Wrap a promise with a timeout
 */
export declare const withTimeout: <T>(
  promise: Promise<T>,
  timeoutMs: number,
  testKey: string,
) => Promise<T>
