export default (/** @type {any} */ tests) => {
  globalThis.before = true
  globalThis.tests = tests

  return () => {
    delete globalThis.before
  }
}
