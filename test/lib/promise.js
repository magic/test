const { promise } = require('../../src')

const fnWithCb = (err, arg, cb) => {
  if (typeof err === 'string') {
    err = new Error(err)
  }
  cb(err, arg)
}

const fns = [
  { fn: promise(r => fnWithCb(null, 'arg', r)), expect: 'arg' },
  {
    fn: promise(r => fnWithCb(new Error('arg'), null, r)),
    expect: e => e instanceof Error,
  },
]

module.exports = fns
