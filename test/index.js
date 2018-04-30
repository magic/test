module.exports = {
  // standard vals that get exported
  vals: require('./vals'),
  // library util functions
  lib: require('./lib'),
  // mem store for test stats
  store: require('./store'),
  // complicated test structure
  structure: require('./structure'),
  // export spec
  spec: require('./spec'),
  // format/prettier config
  format: require('./format'),
  // test suite beforeAll/afterAll tests
  beforeAll: require('./beforeAll'),
}
