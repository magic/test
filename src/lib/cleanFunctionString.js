import is from '@magic/types'

/**
 *
 * @param {unknown} fn
 * @returns {string}
 */
export const cleanFunctionString = fn => {
  if (!fn) {
    return 'false'
  }

  if (is.number(fn) || is.boolean(fn)) {
    return `${fn}`
  }

  if (is.function(fn.toString)) {
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

  return JSON.stringify(fn)
}
