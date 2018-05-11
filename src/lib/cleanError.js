const cleanError = e => {
  const [err, file] = e.stack.split('\n')
  const stack = [err, file.replace('    ', '')]
  return stack
}

export default cleanError
