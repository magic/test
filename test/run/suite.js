import { runSuite } from '../../src/run/suite.js'
import { store } from '../../src/lib/index.js'

export default [
  {
    name: 'runSuite with empty tests array returns undefined for index files',
    fn: async () => {
      store.set('startTime', Date.now())
      const result = await runSuite({
        name: 'index.js',
        parent: 'test',
        pkg: 'test-pkg',
        tests: [],
      })
      return result === undefined
    },
    expect: true,
  },
  {
    name: 'runSuite with index.mjs returns undefined',
    fn: async () => {
      store.set('startTime', Date.now())
      const result = await runSuite({
        name: 'index.mjs',
        parent: 'test',
        pkg: 'test-pkg',
        tests: [],
      })
      return result === undefined
    },
    expect: true,
  },
  {
    name: 'runSuite runs nested object exports',
    fn: async () => {
      store.set('startTime', Date.now())
      const result = await runSuite({
        name: 'parent',
        parent: 'test',
        pkg: 'test-pkg',
        tests: {
          child: [{ fn: true, expect: true }],
        },
      })
      return result && result.tests && result.tests.length > 0
    },
    expect: true,
  },
]
