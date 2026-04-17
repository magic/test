/**
 * @param {unknown} e
 * @returns {string[] | Error | unknown}
 */
export const cleanError = e => {
  if (!e || typeof e !== 'object') {
    return e
  }
  const errObj = e
  if (!errObj.stack || typeof errObj.stack !== 'string') {
    return e
  }
  const [err, file] = errObj.stack.split('\n')
  if (!file) {
    return err ? [err] : ['']
  }
  const stack = [err || '', file.replace('    ', '')]
  return stack
}
