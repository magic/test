export default tests => {
  global.before = true
  global.tests = tests

  return () => {
    delete global.before
  }
}
