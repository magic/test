const is = require('@magic/types')

const { cleanError } = require('../../src/lib')

const error = new Error('testerror')

const errorObject = {
  stack: 'test',
  unrelated: true,
}

module.exports = [
  { fn: cleanError(error), expect: is.array },
  { fn: cleanError(error), expect: is.len.eq(2) },
  {
    fn: cleanError(error),
    expect: ([e]) => e.includes('testerror'),
  },
  { fn: cleanError(error), expect: ([_, e]) => e.startsWith('at') },
  { fn: cleanError(error), expect: ([_, e]) => e.startsWith('at') },
  {
    fn: cleanError('test'),
    expect: 'test',
    info: 'errors without file property (newlines) get returned unchanged',
  },
  {
    fn: cleanError(errorObject),
    expect: is.deep.eq(errorObject),
    info: 'errors with a .stack prop but no newlines in it will return first line',
  },
]
