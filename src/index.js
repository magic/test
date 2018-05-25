const run = require('./run')

const { curry, env, mock, promise, store, vals, version, tryCatch } = require('./lib')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

module.exports = Object.assign(run, {
  curry,
  env,
  log: require('@magic/log'),
  is: require('@magic/types'),
  mock,
  promise,
  run,
  store,
  vals,
  version,
  tryCatch,
})
