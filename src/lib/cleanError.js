const is = require('@magic/types')

const cleanError = e => {
  if (is.undefined(e.stack) || is.undefined(e.stack.split)) {
    return e
  }

  const [err, file] = e.stack.split('\n')
  if (!file) {
    return e
  }
  const stack = [err, file.replace('    ', '')]
  return stack
}

module.exports = cleanError
