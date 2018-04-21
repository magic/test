const is = require('@magic/types')

const curry = require('../../src/lib/curry')

const fn = v => v
const add = (a, b, c) => a + b + c

module.exports = [
  { fn: () => curry(fn, 'test'), expect: 'test' },
  { fn: () => curry('test', (a, b, c) => a + b + c, 'test2'), expect: is.fn },
  { fn: () => curry('test', (a, b) => a + b, 'test2'), expect: 'testtest2' },
  { fn: () => curry('test', v => v), expect: 'test' },
  { fn: () => curry(() => true), expect: true },
  { fn: () => curry(() => {}), expect: undefined },
  { fn: () => curry(), expect: is.error },
  // curry returns functions if arguments are not satisfied
  { fn: () => curry(v => v), expect: is.function },
  { fn: () => curry(a => {}), expect: is.function },
  { fn: () => curry(is.type, 'object'), expect: is.function },
  // currying
  { fn: () => curry(add, 1)(2)(3), expect: 6 },
  { fn: () => curry(add, 1)(2)(-3), expect: 0 },
]
