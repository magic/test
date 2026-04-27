import is from '@magic/types'
/**
 * @param {unknown} e
 * @returns {string[] | Error | unknown}
 */
export const cleanError = e => {
  if (!e || !is.object(e)) {
    return e
  }
  const errObj = e
  if (!errObj.stack || !is.string(errObj.stack)) {
    return e
  }
  const [err, file] = errObj.stack.split('\n')
  if (!file) {
    return err ? [err] : ['']
  }
  const stack = [err || '', file.replace('    ', '')]
  return stack
}
