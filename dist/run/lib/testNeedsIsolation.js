import { GLOBAL_MODIFICATION_RE } from '../../constants.js'
export const testNeedsIsolation = test => {
  if (test.component) {
    return true
  }
  if (test.before || test.after) {
    return true
  }
  if (test.fn) {
    const fnStr = test.fn.toString()
    if (GLOBAL_MODIFICATION_RE.test(fnStr)) {
      return true
    }
  }
  return false
}
