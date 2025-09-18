import is from '@magic/types'

import { expectedArguments } from './expectedArguments.js'

const invalidArgsMsg = 'curry expects a function as first or last argument'
const tooManyArgsMsg = 'too many arguments passed to curried function'

export const curry = (...a) => {
  const args = []
  let fn
  a.map(arg => {
    if (is.fn(arg)) {
      fn = arg
    } else {
      args.push(arg)
    }
  })

  if (!is.fn(fn)) {
    throw Error(invalidArgsMsg)
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
