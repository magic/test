import is from '@magic/types'

import { env } from '../../src/lib/index.js'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'env.isNodeProd equals NODE_ENV',
  },
  {
    fn: env.isProd,
    expect: process.argv.includes('-p'),
    info: 'isProd is equal to process.argv args',
  },
  {
    fn: env.isVerbose,
    expect: process.argv.includes('--verbose'),
    info: 'isVerbose is equal to process.argv args',
  },
]
