import log from '@magic/log'
import { runSuite } from '../../src/run/suite.js'
import { createStore } from '../../src/lib/store.js'

export default [
  {
    name: 'runSuite with empty tests array returns undefined for index files',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'index.js',
        parent: 'suite-test1',
        pkg: 'suite-pkg1',
        tests: [],
        store,
      })
      return result === undefined
    },
    expect: true,
  },
  {
    name: 'runSuite with index.mjs returns undefined',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'index.mjs',
        parent: 'suite-test2',
        pkg: 'suite-pkg2',
        tests: [],
        store,
      })
      return result === undefined
    },
    expect: true,
  },
  {
    name: 'runSuite runs nested object exports',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'parent',
        parent: 'suite-test3',
        pkg: 'suite-pkg3',
        tests: {
          child: [{ fn: true, expect: true }],
        },
        store,
      })
      return result && result.tests && result.tests.length > 0
    },
    expect: true,
  },
  {
    name: 'runSuite runs array of tests',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'test-suite',
        parent: 'suite-test4',
        pkg: 'suite-pkg4',
        tests: [
          { fn: () => 1, expect: 1, name: 't1', pkg: 'p', parent: '' },
          { fn: () => 2, expect: 2, name: 't2', pkg: 'p', parent: '' },
        ],
        store,
      })
      return result && result.tests && result.tests.length === 2
    },
    expect: true,
  },
  {
    name: 'runSuite handles beforeAll hook',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      let beforeAllCalled = false
      const result = await runSuite({
        name: 'beforeAll-suite',
        parent: 'suite-test5',
        pkg: 'suite-pkg5',
        tests: {
          beforeAll: () => {
            beforeAllCalled = true
          },
          child: [{ fn: true, expect: true }],
        },
        store,
      })
      return result && !!beforeAllCalled
    },
    expect: true,
  },
  {
    name: 'runSuite handles afterAll hook',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      let afterAllCalled = false
      const result = await runSuite({
        name: 'afterAll-suite',
        parent: 'suite-test6',
        pkg: 'suite-pkg6',
        tests: {
          afterAll: () => {
            afterAllCalled = true
          },
          child: [{ fn: true, expect: true }],
        },
        store,
      })
      return result && !!afterAllCalled
    },
    expect: true,
  },
  {
    name: 'runSuite beforeAll that returns cleanup function calls it after tests',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      let cleanupCalled = false
      const result = await runSuite({
        name: 'beforeAll-cleanup-suite',
        parent: 'suite-test7',
        pkg: 'suite-pkg7',
        tests: {
          beforeAll: () => {
            return Promise.resolve(() => {
              cleanupCalled = true
            })
          },
          child: [{ fn: true, expect: true }],
        },
        store,
      })
      return result && !!cleanupCalled
    },
    expect: true,
  },
  {
    name: 'runSuite returns suite with name property',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'named-suite',
        parent: 'suite-test8',
        pkg: 'suite-pkg8',
        tests: [{ fn: true, expect: true, name: 'test', pkg: 'p', parent: '' }],
        store,
      })
      return result && result.name === 'named-suite'
    },
    expect: true,
  },
  {
    name: 'runSuite returns suite with parent property',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'child-suite',
        parent: 'parent-suite',
        pkg: 'suite-pkg9',
        tests: [{ fn: true, expect: true, name: 'test', pkg: 'p', parent: '' }],
        store,
      })
      return result && result.parent === 'parent-suite'
    },
    expect: true,
  },
  {
    name: 'runSuite returns suite with pkg property',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'pkg-suite',
        parent: 'suite-test10',
        pkg: 'my-pkg-suite',
        tests: [{ fn: true, expect: true, name: 'test', pkg: 'p', parent: '' }],
        store,
      })
      return result && result.pkg === 'my-pkg-suite'
    },
    expect: true,
  },
  {
    name: 'runSuite returns suite with duration property',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'duration-suite',
        parent: 'suite-test11',
        pkg: 'suite-pkg11',
        tests: [{ fn: () => true, expect: true, name: '', pkg: '', parent: '' }],
        store,
      })
      return result && typeof result.duration === 'string'
    },
    expect: true,
  },
  {
    name: 'runSuite handles nested deeply nested object exports',
    fn: async () => {
      const store = createStore()
      store.set({ startTime: log.hrtime() })
      const result = await runSuite({
        name: 'level1',
        parent: 'suite-test12',
        pkg: 'suite-pkg12',
        tests: {
          level2: {
            level3: [{ fn: true, expect: true }],
          },
        },
        store,
      })
      return result && result.tests && result.tests.length > 0
    },
    expect: true,
  },
]
