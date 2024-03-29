import is from '@magic/types'

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

export default cleanError
