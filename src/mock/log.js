const { isProd } = require('../../src')
const log = require('@magic/log')

module.exports = {
  log: (...args) => isProd && console.log(args) || false,
  warn: (...args) => log.info(args),
  error: (...args) => log.info(args),
}
