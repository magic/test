import is from '@magic/types'

/**
 * @param {unknown} e
 * @returns {string[] | Error | unknown}
 */
export const cleanError = (e: unknown): string[] | Error | unknown => {
  if (!e || !is.object(e)) {
    return e
  }

  const errObj = e as { stack?: string }

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

/**
 * Normalize any thrown value into a clean error (2-line stack) for logging.
 * Wraps non-Error values so callers don't repeat the is.error() dance.
 */
export const toCleanError = (e: unknown): string[] | Error | unknown =>
  cleanError(is.error(e) ? e : new Error(String(e)))
