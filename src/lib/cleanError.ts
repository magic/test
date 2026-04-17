import is from '@magic/types'

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
