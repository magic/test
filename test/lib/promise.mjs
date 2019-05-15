import is from '@magic/types'

import { promise } from '../../src/index.mjs'

const fnWithCb = (err = null, arg, cb) => {
  if (is.str(err)) {
    err = new Error(err)
  }
  cb(err, arg)
}

export default [
  {
    fn: promise(r => fnWithCb(null, 'arg', r)),
    expect: 'arg',
    info: 'can handle return values',
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([e]) => is.err(e),
    info: 'can handle returned errors',
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([a, b]) => b === 'arg',
    info: 'if errors returns argument after error',
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), null, r)),
    expect: is.err,
    info: 'returns an error if there is one and no arg',
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), new Error('err2'), r)),
    expect: r => r.every(is.err),
    info: 'returns two errors if two are passed',
  },
]
