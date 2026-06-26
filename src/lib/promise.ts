import is from '@magic/types'

/**
 * Result of calling a wrapped function — either a single value or an array of values.
 */

/**
 * Creates an argument handler that filters out `undefined` and `null` values,
 * and either returns a single argument or an array of arguments to the wrapped function.
 * Pre-allocates array with length hint for better performance.
 */
export const argHandler =
  (r: (arg: unknown | undefined) => void) =>
  (...args: Array<unknown | undefined | null>): void => {
    // Pre-allocate with length hint
    const returnArgs = new Array(args.length)
    let len = 0

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (is.defined(arg) && !is.null(arg)) {
        returnArgs[len++] = arg
      }
    }

    if (len === 1) {
      return r(returnArgs[0])
    }

    // Truncate to actual length if multiple args
    if (len > 0) {
      returnArgs.length = len
      return r(returnArgs)
    }

    r(undefined)
  }

/**
 * Wraps a function into a Promise-returning function, passing arguments via `argHandler`.
 */
export const promise =
  (fn: (handler: (...args: unknown[]) => void) => void): (() => Promise<unknown | undefined>) =>
  () =>
    new Promise(r => fn(argHandler(r)))
