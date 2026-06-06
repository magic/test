export const testNeedsIsolation = (test, suite) => {
  if (test.before || test.after) {
    return true
  }
  if (suite && (suite.beforeEach || suite.afterEach)) {
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
