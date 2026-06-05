import is from '@magic/types'
const CLEAN_PATTERNS = [
  [/async\s+t\s*=>\s*await\s+/g, ''],
  [/async\s+t\s*=>\s+/g, ''],
  [/async\s*\(\s*t\s*\)\s*=>\s*await\s+/g, ''],
  [/async\s*\(\s*t\s*\)\s*=>\s+/g, ''],
  [/async\s*\(\s*\)\s*=>\s*await\s+/g, ''],
  [/async\s*\(\s*\)\s*=>\s+/g, ''],
  [/async\s*\(\s*\)\s*=>/g, ''],
  [/t\s*=>\s+/g, ''],
  [/\(\s*t\s*\)\s*=>\s+/g, ''],
  [/\(\s*\)\s*=>\s+/g, ''],
]
export const cleanFunctionString = fn => {
  if (!fn) {
    return 'false'
  }
  if (is.number(fn) || is.boolean(fn)) {
    return `${fn}`
  }
  if (is.function(fn.toString)) {
    let str = fn.toString()
    for (const [pattern, replacement] of CLEAN_PATTERNS) {
      str = str.replace(pattern, replacement)
    }
    return str
  }
  return JSON.stringify(fn)
}
