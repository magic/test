import is from '@magic/types'

import { curry, tryCatch } from '../../src/lib/index.js'

const fn = v => v

const add = (a, b, c) => a + b + c

export default [
  { fn: () => curry(fn, 'test'), expect: 'test' },
  { fn: () => curry('test', (a, b, c) => a + b + c, 'test2'), expect: is.fn },
  { fn: () => curry('test', (a, b) => a + b, 'test2'), expect: 'testtest2' },
  { fn: () => curry('test', v => v), expect: 'test' },
  { fn: () => curry(() => true), expect: true },
  { fn: () => curry(() => {}), expect: undefined },
  { fn: tryCatch(curry), expect: is.error },
  // curry returns functions if arguments are not satisfied
  { fn: () => curry(v => v), expect: is.function },
  { fn: () => curry(_a => {}), expect: is.function },
  { fn: () => curry(is.type, 'object'), expect: is.function },

  // currying
  { fn: () => curry(add, 1)(2)(3), expect: 6 },
  { fn: () => curry(add, 1)(2)(-3), expect: 0 },

  // too many args
  { fn: tryCatch(curry, add, 1, 2, 3, 4), expect: is.error },
]
