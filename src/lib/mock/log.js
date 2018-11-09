const log = require('@magic/log')

const env = require('../env')

const cons = console

module.exports = {
  log: (...args) => (env.isNodeProd() && cons.log(...args)) || false,
  warn: (...args) => log.info(args),
  error: (...args) => cons.error(...args),
}
