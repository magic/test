const { is, mock, env } = require('../../../src')

const testLogging = t => (env.isNodeProd() ? t === false : t === true)

module.exports = [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: testLogging, info: 'log.log logs in dev but not prod' },
  { fn: mock.log.warn('test'), expect: testLogging, info: 'log.warn logs in dev but not prod' },
  { fn: mock.log.error('test'), expect: true, info: 'log.error always returns true' },
]
