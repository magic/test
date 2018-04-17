const test = require('../src')
const is = require('@magic/types')

const fns = [
  { fn: () => test, expect: is.fn },
  { fn: () => test.run, expect: is.fn },
  { fn: () => test.promise, expect: is.fn },
  { fn: () => test.log, expect: is.fn },
  { fn: () => test.is.array, expect: is.fn },
]

module.exports = fns
