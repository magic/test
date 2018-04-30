const { isProd } = require('../../src')
const log = require('@magic/log')

const cons = console

module.exports = {
  log: (...args) => isProd && cons.log(...args) || false,
  warn: (...args) => log.info(args),
  error: (...args) => cons.error(...args),
}
