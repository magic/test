const test = require('../src')
const is = require('@magic/types')

module.exports = [
  { fn: () => test, expect: is.fn },
  { fn: () => test.run, expect: is.fn },
  { fn: () => test.promise, expect: is.fn },
  { fn: () => test.log, expect: is.fn },
  { fn: () => test.store, expect: is.obj },
  { fn: () => test.is.array, expect: is.fn },
  { fn: () => test.curry, expect: is.fn },
]
