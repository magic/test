import is from '@magic/types'
import * as stats from '#lib/stats/index.js'
import { info, reset } from '#lib/stats/index.js'
import type { TestCase } from '#src/types.js'

export default [
  { fn: () => stats, expect: is.obj, info: 'stats exports a function' },
  { fn: () => stats.info, expect: is.fn, info: 'stats.info exports a function' },
  { fn: () => stats.reset, expect: is.fn, info: 'stats.reset exports a function' },
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
] satisfies TestCase[]
