import is from '@magic/types'
export const cleanFunctionString = fn => {
  if (!fn) {
    return 'false'
  }
  if (is.number(fn) || is.boolean(fn)) {
    return `${fn}`
  }
  if (is.function(fn.toString)) {
    return fn
      .toString()
      .replace(/async\s+t\s*=>\s*await\s+/g, '')
      .replace(/async\s+t\s*=>\s+/g, '')
      .replace(/async\s*\(\s*t\s*\)\s*=>\s*await\s+/g, '')
      .replace(/async\s*\(\s*t\s*\)\s*=>\s+/g, '')
      .replace(/async\s*\(\s*\)\s*=>\s*await\s+/g, '')
      .replace(/async\s*\(\s*\)\s*=>\s+/g, '')
      .replace(/async\s*\(\s*\)\s*=>/g, '')
      .replace(/t\s*=>\s+/g, '')
      .replace(/\(\s*t\s*\)\s*=>\s+/g, '')
      .replace(/\(\s*\)\s*=>\s+/g, '')
  }
  return JSON.stringify(fn)
}
