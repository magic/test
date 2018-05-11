import is from '@magic/types'

const cleanFunctionString = fn => {
  if (!fn) {
    return false
  }

  if (!is.function(fn) && !is.string(fn)) {
    return fn
  }

  return fn
    .toString()
    .replace('async t => await ', '')
    .replace('async t => ', '')
    .replace('async () => await ', '')
    .replace('async () => ', '')
    .replace('async (t) => await ', '')
    .replace('async (t) => ', '')
    .replace('t => ', '')
    .replace('(t) => ', '')
    .replace('() => ', '')
}

export default cleanFunctionString
