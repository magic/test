import is from '@magic/types'

export const expectedArguments = (fn?: (...args: unknown[]) => unknown): string | string[] => {
  if (!is.function(fn)) {
    return []
  }

  const fnStr = fn.toString()
  let expected

  if (fnStr.startsWith('()')) {
    return []
  }

  if (!fnStr.includes('(') && fnStr.includes('=>')) {
    expected = fnStr.split('=>')[0]?.trim()
  } else {
    const start = fnStr.indexOf('(') + 1
    const end = fnStr.indexOf(')')
    expected = fnStr.substring(start, end)
  }

  if (!expected) {
    if (fnStr.includes('=>')) {
      return fnStr.split('=>')[0]?.trim() || ''
    }

    return []
  }

  return expected.split(',').map(arg => {
    const trimmed = arg.trim()
    if (trimmed.length >= 2 && trimmed.charAt(0) === '[' && trimmed.charAt(1) === '_') {
      return '[' + trimmed.slice(2)
    }
    if (trimmed.length >= 2 && trimmed.charAt(0) === '{' && trimmed.charAt(1) === '_') {
      return '{' + trimmed.slice(2)
    }
    return trimmed
  })
}
