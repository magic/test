const log = require('@magic/log')

const { isNodeProd } = require('../env')

const cons = console
cons.error({ isNodeProd  })

module.exports = {
  log: (...args) => isNodeProd() && cons.log(...args) || false,
  warn: (...args) => log.info(args),
  error: (...args) => cons.error(...args),
}
