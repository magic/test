const run = require('./run')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

module.exports = Object.assign(run, {
  run,
  promise: require('./lib/promise'),
  log: require('@magic/log'),
  is: require('@magic/types'),
  store: require('./store'),
  vals: require('./vals'),
  curry: require('./lib/curry'),
  version: require('./version'),
  mock: require('./mock'),
  isProd: ['-p', '--prod', '--production'].some(t => process.argv.indexOf(t) > -1),
})
