const is = require('@magic/types')

const stats = require('../../src/lib/stats')

const t = {
  fn: () => true,
  expect: true,
  info: 'true is true',
  key: 'testing',
}

module.exports = [
  { fn: () => stats, expect: is.obj, info: 'stats exports a function' },
  { fn: () => stats.info, expect: is.fn, info: 'stats exports a function' },
  { fn: () => stats.reset, expect: is.fn, info: 'stats exports a function' },
  { fn: () => stats.test, expect: is.fn, info: 'stats exports a function' },
]
