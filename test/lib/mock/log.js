const { is, mock, env } = require('../../../src')

module.exports = [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: t => (env.isNodeProd() ? t === false : t === true) },
  { fn: mock.log.warn('test'), expect: t => (env.isNodeProd() ? t === false : t === true) },
  { fn: mock.log.error('test'), expect: undefined },
]
