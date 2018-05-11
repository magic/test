import is from '@magic/types'

const argHandler = r => (...args) => {
  args = args.filter(arg => is.defined(arg) && !is.null(arg))

  if (args.length === 1) {
    return r(args[0])
  }

  r(args)
}

export const promise = fn => () => new Promise(r => fn(argHandler(r)))

export default promise
