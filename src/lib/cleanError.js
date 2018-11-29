const cleanError = e => {
  const [err, file] = e.stack.split('\n')
  if (!file) {
    return e
  }
  const stack = [err, file.replace('    ', '')]
  return stack
}

module.exports = cleanError
