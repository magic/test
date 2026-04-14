import is from '@magic/types'
import { tryCatch } from '../../src/index.js'

const catchPromise = (arg: unknown) => (res: (v: unknown) => void, rej: (e: Error) => void) =>
  setTimeout(() => (arg ? res(arg) : rej(new Error('test'))))

const promise = (arg: unknown) => new Promise(catchPromise(arg))

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
    fn: tryCatch((...a: unknown[]) => a, 1, 2, 3),
    expect: is.deep.equal([1, 2, 3]),
    info: 'returns function arguments as array',
  },
  { fn: tryCatch(promise, true), expect: true, info: 'can try promises' },
  { fn: tryCatch(promise), expect: is.error, info: 'can catch promises' },
  {
    fn: tryCatch(async (arg: unknown) => await arg, 'pass'),
    expect: 'pass',
    info: 'can try async await',
  },
  {
    fn: tryCatch(async (arg: unknown) => await arg, new Error('test')),
    expect: is.error,
    info: 'can catch async await',
  },
]
