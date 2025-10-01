import is from '@magic/types'
import { expectedArguments } from './expectedArguments.js'

const invalidArgsMsg = 'curry expects a function as first or last argument'
const tooManyArgsMsg = 'too many arguments passed to curried function'

/**
 * @template TArgs
 * @template TReturn
 * @typedef {(arg: any) => TReturn|CurryFunction<TArgs, TReturn>} CurryFunction
 */

/**
 * Curry a function by pre-filling its arguments.
 *
 * @template TArgs
 * @template TReturn
 * @param {...(Function|any)} a - Arguments to curry, including the target function
 * @returns {TReturn|CurryFunction<TArgs, TReturn>}
 */
export const curry = (...a) => {
  /** @type {any[]} */
  const args = []

  /** @type {Function|undefined} */
  let fn

  a.map(arg => {
    if (is.fn(arg)) {
      fn = arg
    } else {
      args.push(arg)
    }
  })

  if (!is.fn(fn)) {
    throw new Error(invalidArgsMsg)
  }

  const expectedArgs = expectedArguments(fn)

  if (args.length === expectedArgs.length) {
    return fn(...args)
  } else if (args.length > expectedArgs.length) {
    throw new Error(tooManyArgsMsg)
  } else {
    return b => curry(fn, ...args, b)
  }
}
