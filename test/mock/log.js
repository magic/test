const { is, mock, isNodeProd } = require('../../src')

module.exports = [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: isNodeProd() ? false : true },
  { fn: mock.log.warn('test'), expect: isNodeProd() ? false : true },
  { fn: mock.log.error('test'), expect: undefined },
]
