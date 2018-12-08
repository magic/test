const is = require('@magic/types')

const { cleanError } = require('../../src/lib')

const error = new Error('testerror')

module.exports = [
  { fn: cleanError(error), expect: is.array },
  { fn: cleanError(error), expect: is.len.eq(2) },
  {
    fn: cleanError(error),
    expect: ([e]) => e.includes('testerror'),
  },
  { fn: cleanError(error), expect: ([_, e]) => e.startsWith('at') },
  { fn: cleanError(error), expect: ([_, e]) => e.startsWith('at') },
  { fn: cleanError('test'), expect: 'test', info: 'errors without file property get returned unchanged' },
]