import is from '@magic/types'
import * as stats from '../../src/lib/stats/index.js'
import { info, reset, test } from '../../src/lib/stats/index.js'
import { Store } from '../../src/lib/store.js'

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
  {
    fn: () => {
      const store = new Store()
      store.set({ results: {} })
      stats.test({ name: 'test1', parent: 'suite1', pkg: 'pkg1', pass: true }, store)
      stats.test({ name: 'test2', parent: 'suite1', pkg: 'pkg1', pass: false }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results.suite1.all === 2 && results.suite1.pass === 1
    },
    expect: (r: boolean) => r === true,
    info: 'test() records parent suite results',
  },
]
