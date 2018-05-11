import { is, mock, isNodeProd } from '../../src'

export default [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: isNodeProd() ? false : true },
  { fn: mock.log.warn('test'), expect: isNodeProd() ? false : true },
  { fn: mock.log.error('test'), expect: undefined },
]
