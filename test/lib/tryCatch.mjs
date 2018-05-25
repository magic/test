import is from '@magic/types'

import { tryCatch } from '../../src/lib/tryCatch'

const catchFn = (...args) => args

const promise = arg => new Promise((res, rej) => setTimeout(arg ? res(arg) : rej(false)))

export default [
  {
    fn: tryCatch(() => {
      throw new Error('test')
    }),
    expect: is.error,
    info: 'errors get caught',
  },
  { fn: tryCatch(() => true), expect: true, info: 'returns function result on non-error' },
  {
    fn: tryCatch((...a) => a, 1, 2, 3),
    expect: is.deep.equal([1, 2, 3]),
    info: 'returns function arguments as array',
  },
  { fn: tryCatch(promise, true), expect: true, info: 'can try promises' },
  { fn: tryCatch(promise), expect: false, info: 'can catch promises' },
  { fn: tryCatch(async arg => await arg, 'pass'), expect: 'pass', info: 'can catch async await' },
]
