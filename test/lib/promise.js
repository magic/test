const is = require('@magic/types')

const { promise } = require('../../src')

const fnWithCb = (err, arg, cb) => {
  if (is.str(err)) {
    err = new Error(err)
  }
  cb(err, arg)
}

const fns = [
  { fn: promise(r => fnWithCb(null, 'arg', r)), expect: 'arg' },
  {
    fn: promise(r => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([e]) => is.err(e),
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), 'arg', r)),
    expect: ([a, b]) => b === 'arg',
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), null, r)),
    expect: is.err,
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), null, r)),
    expect: is.err,
  },
  {
    fn: promise(r => fnWithCb(new Error('err'), new Error('err2'), r)),
    expect: r => r.every(is.err),
  },
]

module.exports = fns
