const log = require('@magic/log')

module.exports = {
  log: (...args) => log.info(args),
  warn: (...args) => log.info(args),
  error: (...args) => log.info(args),
}
