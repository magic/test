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
    .replace('async t => ', '')
    .replace('async () => await ', '')
    .replace('async () => ', '')
    .replace('async (t) => await ', '')
    .replace('async (t) => ', '')
    .replace('t => ', '')
    .replace('(t) => ', '')
    .replace('() => ', '')
}

module.exports = cleanFunctionString
