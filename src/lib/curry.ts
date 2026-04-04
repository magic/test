import is from '@magic/types'
import { expectedArguments } from './expectedArguments.ts'

const invalidArgsMsg = 'curry expects a function as first or last argument'
const tooManyArgsMsg = 'too many arguments passed to curried function'

/**
 * Curry a function by pre-filling its arguments.
 */
export function curry(fnOrArg: Function | unknown, ...args: unknown[]): unknown {
  let fn: Function
  let preFilled: unknown[] = []

  if (is.fn(fnOrArg)) {
    fn = fnOrArg
  } else {
    // Find the function in the arguments
    const fnIndex = args.findIndex(arg => is.fn(arg))
    if (fnIndex === -1) {
      throw new Error(invalidArgsMsg)
    }
    fn = args[fnIndex] as Function
    // Collect pre-filled args: fnOrArg + everything before the function
    preFilled = [fnOrArg, ...args.slice(0, fnIndex)]
    // Remove the function from args, keep only args after it
    args = args.slice(fnIndex + 1)
  }

  const expectedArgs = expectedArguments(fn)
  const allArgs = [...preFilled, ...args]

  if (allArgs.length === expectedArgs.length) {
    return fn(...allArgs)
  } else if (allArgs.length > expectedArgs.length) {
    throw new Error(tooManyArgsMsg)
  } else {
    return (b: unknown) => curry(fn, ...allArgs, b)
  }
}
