import is from '@magic/types'
import { expectedArguments } from './expectedArguments.ts'

const invalidArgsMsg = 'curry expects a function as first or last argument'
const tooManyArgsMsg = 'too many arguments passed to curried function'

/**
 * Curry a function by pre-filling its arguments.
 */
export function curry(fnOrArg: Function | unknown, ...args: unknown[]): unknown {
  let fn: Function

  if (is.fn(fnOrArg)) {
    fn = fnOrArg
  } else {
    args.unshift(fnOrArg)
    const lastArg = args.pop()
    if (!is.fn(lastArg)) {
      throw new Error(invalidArgsMsg)
    }
    fn = lastArg
  }

  const expectedArgs = expectedArguments(fn)

  if (args.length === expectedArgs.length) {
    return fn(...args)
  } else if (args.length > expectedArgs.length) {
    throw new Error(tooManyArgsMsg)
  } else {
    return (b: unknown) => curry(fn, ...args, b)
  }
}
