import is from '@magic/types'

import { stats } from '../../src/lib/index.js'
import { info, reset, test } from '../../src/lib/stats/index.js'

export default [
  { fn: () => stats, expect: is.obj, info: 'stats exports a function' },
  { fn: () => stats.info, expect: is.fn, info: 'stats.info exports a function' },
  { fn: () => stats.reset, expect: is.fn, info: 'stats.reset exports a function' },
  { fn: () => stats.test, expect: is.fn, info: 'stats.test exports a function' },
  {
    fn: () => test,
    expect: is.deep.equal(stats.test),
    info: 'lib.stats.test and stats.test are the same export',
  },
  {
    fn: () => reset,
    expect: is.deep.equal(stats.reset),
    info: 'lib.stats.reset and stats.reset are the same export',
  },
  {
    fn: () => info,
    expect: is.deep.equal(stats.info),
    info: 'lib.stats.info and stats.info are the same export',
  },
]
