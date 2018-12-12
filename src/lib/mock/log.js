const env = require('../env')

module.exports = {
  log: () => !env.isNodeProd(),
  warn: () =>!env.isNodeProd(),
  error: () => true,
  time: () => !env.isNodeProd(),
  timeEnd: () => !env.isNodeProd(),
}
