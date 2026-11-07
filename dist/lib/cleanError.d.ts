/**
 * @param {unknown} e
 * @returns {string[] | Error | unknown}
 */
export declare const cleanError: (e: unknown) => string[] | Error | unknown
/**
 * Normalize any thrown value into a clean error (2-line stack) for logging.
 * Wraps non-Error values so callers don't repeat the is.error() dance.
 */
export declare const toCleanError: (e: unknown) => string[] | Error | unknown
