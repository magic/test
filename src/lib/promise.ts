import is from '@magic/types'

/**
 * Result of calling a wrapped function — either a single value or an array of values.
 */

/**
 * Creates an argument handler that filters out `undefined` and `null` values,
 * and either returns a single argument or an array of arguments to the wrapped function.
 */
export const argHandler =
  (r: (arg: unknown | undefined) => void) =>
  (...args: Array<unknown | undefined | null>): void => {
    const returnArgs: unknown[] = []
    args.forEach(arg => is.defined(arg) && !is.null(arg) && returnArgs.push(arg))

    if (returnArgs.length === 1) {
      return r(returnArgs[0])
    }

    r(returnArgs.length ? returnArgs : undefined)
  }

/**
 * Wraps a function into a Promise-returning function, passing arguments via `argHandler`.
 */
export const promise =
  (fn: (handler: (...args: unknown[]) => void) => void): (() => Promise<unknown | undefined>) =>
  () =>
    new Promise(r => fn(argHandler(r)))
