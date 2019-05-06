import { is, mock, env } from '../../../src/index.mjs'

const mayLog = t => (env.isNodeProd() ? t === false : t === true)

export default [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: mayLog, info: 'log.log logs in dev but not prod' },
  { fn: mock.log.warn('test'), expect: mayLog, info: 'log.warn logs in dev but not prod' },
  { fn: mock.log.error('test'), expect: true, info: 'log.error always returns true' },
  { fn: mock.log.time('test'), expect: mayLog, info: 'log.time logs in dev but not prod' },
  { fn: mock.log.timeEnd('test'), expect: mayLog, info: 'log.timeEnd logs in dev but not prod' },
]
