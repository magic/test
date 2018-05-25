import is from '@magic/types'

import { mock, env } from '../../../src/lib'

export default [
  { fn: mock.log, expect: is.object },
  { fn: mock.log.log('test'), expect: env.isNodeProd() },
  { fn: mock.log.warn('test'), expect: !env.isNodeProd() },
  { fn: mock.log.error('test'), expect: true },
]
