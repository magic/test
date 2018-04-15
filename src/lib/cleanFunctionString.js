const cleanFunctionString = fn => {
  if (!fn) {
    return false
  }

  if (typeof fn !== 'function' && typeof fn !== 'string') {
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

module.exports = cleanFunctionString
