const run = require('./run')

const { h, app } = require('hyperapp')
const { curry, env, mock, promise, store, vals, version, tryCatch } = require('./lib')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

module.exports = Object.assign(run, {
  curry,
  env,
  log: require('@magic/log'),
  is: require('@magic/types'),
  deep: require('@magic/deep'),
  mock,
  promise,
  run,
  store,
  vals,
  version,
  tryCatch,
  h, // hyperapp rendering function
  app, // hyperapp app wrapper
})
