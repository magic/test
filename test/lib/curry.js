const is = require('@magic/types')

const curry = require('../../src/lib/curry')

const fns = [
  { fn: curry(v => v, 'test'), expect: 'test' },
  { fn: curry('test', v => v), expect: 'test' },
  {
    fn: () => JSON.stringify(curry('test', 'test2', v => v)()),
    expect: JSON.stringify(['test', 'test2']),
  },
  {
    fn: () => JSON.stringify(curry('test', 'test2', v => v)('test3')),
    expect: JSON.stringify(['test', 'test2', 'test3']),
  },
  {
    fn: () => JSON.stringify(curry('test', v => v)('test2')),
    expect: JSON.stringify(['test', 'test2']),
  },
  { fn: curry(v => true), expect: true },
  { fn: curry(() => {}), expect: undefined },
  { fn: () => curry(), expect: is.error },
]

module.exports = fns
