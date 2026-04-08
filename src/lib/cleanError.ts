/**
 * @param {unknown} e
 * @returns {string[] | Error | unknown}
 */
export const cleanError = (e: unknown): string[] | Error | unknown => {
  if (!e || typeof e !== 'object') {
    return e
  }

  const errObj = e as { stack?: string }

  if (!errObj.stack || typeof errObj.stack !== 'string') {
    return e
  }

  const [err, file] = errObj.stack.split('\n')
  if (!file) {
    return [err]
  }

  const stack = [err, file.replace('    ', '')]
  return stack
}
