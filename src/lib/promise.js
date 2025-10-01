import is from '@magic/types'

/**
 * @template T
 * @typedef {T | T[]} ArgHandlerResult
 * Result of calling a wrapped function — either a single value or an array of values.
 */

/**
 * Creates an argument handler that filters out `undefined` and `null` values,
 * and either returns a single argument or an array of arguments to the wrapped function.
 *
 * @template T
 * @param {(arg: ArgHandlerResult<T> | undefined) => void} r - Callback function to receive the processed arguments.
 * @returns {(...args: Array<T | undefined | null>) => void}
 */
export const argHandler =
  r =>
  (...args) => {
    /** @type {T[]} */
    const returnArgs = []
    args.forEach(arg => is.defined(arg) && !is.null(arg) && returnArgs.push(arg))

    if (returnArgs.length === 1) {
      return r(returnArgs[0])
    }

    r(returnArgs.length ? returnArgs : undefined)
  }

/**
 * Wraps a function into a Promise-returning function, passing arguments via `argHandler`.
 *
 * @template T
 * @param {(handler: (...args: Array<T | undefined | null>) => void) => void} fn - Function that receives an argument handler callback.
 * @returns {() => Promise<ArgHandlerResult<T> | undefined>} Returns a promise that resolves with the handled arguments or undefined.
 */
export const promise = fn => () => new Promise(r => fn(argHandler(r)))
