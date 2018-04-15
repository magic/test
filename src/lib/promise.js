const argHandler = r => (...args) => {
  args = args.filter(arg => typeof arg !== 'undefined' && arg !== null)

  if (args.length === 1) {
    args = args[0]
  }
  r(args)
}

const promise = fn => () => new Promise(r => fn(argHandler(r)))

module.exports = promise
