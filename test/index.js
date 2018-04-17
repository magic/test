// standard vals that get exported
const vals = require('./vals')
// library util functions
const lib = require('./lib')
// complicated test structure
const structure = require('./structure')
// export spec
const spec = require('./spec')

const tests = () => ({
  vals,
  lib,
  spec,
  // structure,
})

module.exports = tests
