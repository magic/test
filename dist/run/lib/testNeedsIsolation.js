export const testNeedsIsolation = test => {
  if (test.before || test.after) {
    return true
  }
  if (Object.hasOwn(test, '__isolate') && test.__isolate === true) {
    return true
  }
  if (test.component) {
    return true
  }
  return false
}
