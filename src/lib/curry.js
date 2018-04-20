const is = require('@magic/types')

const invalidArgsMsg = 'curry expects a function as first or last argument'

const curry = (fn, ...args) => {
  if (!is.fn(fn)) {
    const lastArg = args[args.length - 1]
    if (is.fn(lastArg)) {
      const oldFn = fn
      fn = args.pop()
      args = [].concat(oldFn, args)
    }

    if (!is.fn(fn)) {
      return new Error(invalidArgsMsg)
    }
  }

  return (...fnArgs) => {
    const final = [...args, ...fnArgs]

    if (final.length === 0) {
      return fn()
    }
    if (final.length === 1) {
      return fn(final[0])
    } else {
      return fn(final)
    }
  }
}

module.exports = curry
