const is = require('@magic/types')

const expectedArguments = require('./expectedArguments')

const invalidArgsMsg = 'curry expects a function as first or last argument'

const curry = (...a) => {
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
    return new Error(invalidArgsMsg)
  }

  const expectedArgs = expectedArguments(fn)

  if (args.length >= expectedArgs.length) {
    return fn(...args)
  } else {
    return b => curry(fn, ...args, b)
  }
}

module.exports = curry
