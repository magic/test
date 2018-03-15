const { isUndefinedOrNull, isFunction, isString } = require('types')

const cleanFunctionString = fn => {
  if (isUndefinedOrNull(fn)) {
    return false
  }

  if (!isFunction(fn) && !isString(fn)) {
    return fn
  }

  return fn.toString()
    .replace('async t => await ', '')
    .replace('async () => await ', '')
    .replace('async (t) => await ', '')
    .replace('t => ', '')
    .replace('(t) => ', '')
    .replace('() => ', '')
}

module.exports = cleanFunctionString
