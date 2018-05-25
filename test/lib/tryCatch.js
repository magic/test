const is = require('@magic/types')
const tryCatch = require('../../src/lib/tryCatch')

const catchFn = (...args) => args

module.exports = [
  { fn: tryCatch(() => { throw new Error('test')}), expect: is.error, info: 'errors get caught' },
  { fn: tryCatch(() => true), expect: true, info: 'returns function result on non-error' },
  { fn: tryCatch((...a) => a, 1, 2, 3), expect: is.deep.equal([1, 2, 3]), info: 'returns function arguments as array' },
]
