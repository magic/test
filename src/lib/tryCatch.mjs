export const tryCatch = (fn, ...args) => () => {
  try {
    if (args.length === 0) {
      return fn()
    }
    return fn(...args)
  } catch(e) {
    return e
  }
}

export default tryCatch
