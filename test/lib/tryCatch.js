import is from '@magic/types'
import { tryCatch } from '../../src/lib/index.js'

const catchFn = (...args) => args

const catchPromise = arg => (res, rej) => setTimeout(arg ? res(arg) : rej(new Error('test')))
const promise = arg => new Promise(catchPromise(arg))

export default [
  {
    fn: tryCatch(() => {
      throw new Error('test')
    }),
    expect: is.error,
    info: 'errors get caught',
  },
  {
    fn: tryCatch(() => true),
    expect: true,
    info: 'returns function result on non-error',
  },
  {
    fn: tryCatch((...a) => a, 1, 2, 3),
    expect: is.deep.equal([1, 2, 3]),
    info: 'returns function arguments as array',
  },
  { fn: tryCatch(promise, true), expect: true, info: 'can try promises' },
  { fn: tryCatch(promise), expect: is.error, info: 'can catch promises' },
  {
    fn: tryCatch(async arg => await arg, 'pass'),
    expect: 'pass',
    info: 'can try async await',
  },
  {
    fn: tryCatch(async arg => await arg, new Error('test')),
    expect: is.error,
    info: 'can catch async await',
  },
]
