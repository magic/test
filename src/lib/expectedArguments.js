import is from '@magic/types'

/**
 *
 * @param {Function} [fn]
 * @returns
 */

export const expectedArguments = fn => {
  if (!is.function(fn)) {
    return []
  }

  const fnStr = fn.toString()
  let expected

  if (!fnStr.includes('(') && fnStr.includes('=>')) {
    expected = fnStr.split('=>')[0]
  } else {
    const start = fnStr.indexOf('(') + 1
    const end = fnStr.indexOf(')')
    expected = fnStr.substring(start, end)
  }

  if (!expected) {
    if (fnStr.includes('=>')) {
      expected = fnStr.split('=>')[0]
    }

    return []
  }

  return expected.split(',')
}
