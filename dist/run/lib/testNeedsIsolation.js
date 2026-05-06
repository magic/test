import { testModifiesGlobals } from '../../lib/globalCheck.js'
export const testNeedsIsolation = test => {
  if (test.component) {
    return true
  }
  if (test.before || test.after) {
    return true
  }
  if (testModifiesGlobals(test)) {
    return true
  }
  return false
}
