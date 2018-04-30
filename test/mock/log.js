const { is, mock } = require('../../src')

const isProd = ['-p', '--prod', '--production'].some(t => process.argv.indexOf(t) > -1)

module.exports = [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: isProd ? false : undefined },
  { fn: mock.log.warn('test'), expect: isProd ? false : undefined },
  { fn: mock.log.error('test'), expect: isProd ? false : undefined },
]
