// standard vals that get exported
const vals = require('./vals')
// library util functions
const lib = require('./lib')
// mem store for test stats
const storage = require('./storage')
// complicated test structure
const structure = require('./structure')
// export spec
const spec = require('./spec')
// format/prettier config
const format = require('./format')

const tests = () => ({
  vals,
  lib,
  spec,
  storage,
  structure,
  format,
})

module.exports = tests
