const log = require('@magic/log')

const env = require('../env')

const cons = console

module.exports = {
  log: (...args) => (env.isNodeProd() && console.log(...args)) || false,
  warn: (...args) => log.info(args),
  error: (...args) => console.error(...args),
}
