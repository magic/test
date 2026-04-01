/**
 * @param {TestObject} tests
 */
export default (tests) => {
  globalThis.before = true
  globalThis.tests = tests

  return () => {
    delete globalThis.before
  }
}
