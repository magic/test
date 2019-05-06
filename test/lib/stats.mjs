import is from '@magic/types'

import { stats } from '../../src/lib/index.mjs'

const t = {
  fn: () => true,
  expect: true,
  info: 'true is true',
  key: 'testing',
}

export default [
  { fn: () => stats, expect: is.obj, info: 'stats exports a function' },
  { fn: () => stats.info, expect: is.fn, info: 'stats exports a function' },
  { fn: () => stats.reset, expect: is.fn, info: 'stats exports a function' },
  { fn: () => stats.test, expect: is.fn, info: 'stats exports a function' },
]
