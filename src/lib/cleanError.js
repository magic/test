import is from '@magic/types'

/**
 *
 * @param {Error} e
 * @returns {string[] | Error[] | Error}
 */
export const cleanError = e => {
  if (is.undefined(e?.stack?.split)) {
    return e
  }

  const [err, file] = e.stack.split('\n')
  if (!file) {
    return [err]
  }

  const stack = [err, file.replace('    ', '')]
  return stack
}
