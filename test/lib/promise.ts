import is from '@magic/types'
import { promise } from '../../src/index.js'

const fnWithCb = (
  err: Error | null,
  arg: unknown,
  cb: (err: Error | null, arg: unknown) => void,
) => {
  if (is.str(err)) {
    err = new Error(err)
  }
  cb(err, arg)
}

export default [
  {
    fn: promise(r => fnWithCb(null, 'arg', r as (err: Error | null, arg: unknown) => void)),
    expect: 'arg',
    info: 'can handle return values',
  },
  {
    fn: promise(r =>
      fnWithCb(new Error('err'), 'arg', r as (err: Error | null, arg: unknown) => void),
    ),
    expect: ([e]: [Error]) => is.err(e),
    info: 'can handle returned errors',
  },
  {
    fn: promise(r =>
      fnWithCb(new Error('err'), 'arg', r as (err: Error | null, arg: unknown) => void),
    ),
    expect: ([, b]: [unknown, unknown]) => b === 'arg',
    info: 'if errors returns argument after error',
  },
  {
    fn: promise(r =>
      fnWithCb(new Error('err'), null, r as (err: Error | null, arg: unknown) => void),
    ),
    expect: is.err,
    info: 'returns an error if there is one and no arg',
  },
  {
    fn: promise(r =>
      fnWithCb(new Error('err'), new Error('err2'), r as (err: Error | null, arg: unknown) => void),
    ),
    expect: (r: Error[]) => r.every(is.err),
    info: 'returns two errors if two are passed',
  },
  {
    fn: promise(r =>
      fnWithCb(null, null as unknown, r as (err: Error | null, arg: unknown) => void),
    ),
    expect: is.undefined,
    info: 'returns undefined when all args are null/undefined',
  },
]
