const is = require('@magic/types')

const argHandler = r => (...args) => {
  args = args.filter(arg => is.defined(arg) && !is.null(arg))

  if (args.length === 1) {
    return r(args[0])
  }

  r(args)
}

const promise = fn => () => new Promise(r => fn(argHandler(r)))

module.exports = promise
