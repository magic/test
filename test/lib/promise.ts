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
    fn: promise((r: any) => fnWithCb(null, 'arg', r)),
    expect: 'arg',
    info: 'can handle return values',
  },
  {
    fn: promise((r: any) => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([e]: [Error]) => is.err(e),
    info: 'can handle returned errors',
  },
  {
    fn: promise((r: any) => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([a, b]: [unknown, unknown]) => b === 'arg',
    info: 'if errors returns argument after error',
  },
  {
    fn: promise((r: any) => fnWithCb(new Error('err'), null, r)),
    expect: is.err,
    info: 'returns an error if there is one and no arg',
  },
  {
    fn: promise((r: any) => fnWithCb(new Error('err'), new Error('err2'), r)),
    expect: (r: Error[]) => r.every(is.err),
    info: 'returns two errors if two are passed',
  },
  {
    fn: promise((r: any) => r(null, undefined)),
    expect: is.undefined,
    info: 'returns undefined when all args are null/undefined',
  },
]
