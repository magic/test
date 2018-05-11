import run from './run'

import { isProd, isNodeProd } from './env'

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

export default Object.assign(run, {
  run,
  promise: import('./lib/promise'),
  log: import('@magic/log'),
  is: import('@magic/types'),
  store: import('./store'),
  vals: import('./vals'),
  curry: import('./lib/curry'),
  version: import('./version'),
  mock: import('./mock'),
  isNodeProd,
  isProd,
})
