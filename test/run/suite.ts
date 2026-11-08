import log from '@magic/log'
import { runSuite } from '#src/run/suite.js'
import { createStore } from '#lib/store.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'
import is from '@magic/types'

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
      return result
    },
    expect: undefined,
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
      return result
    },
    expect: undefined,
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
      return result?.tests?.length
    },
    expect: (v: number | undefined) => is.number(v) && is.gt(v, 0),
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
      return result?.tests?.length
    },
    expect: 2,
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
      return { hasResult: !!result, called: beforeAllCalled }
    },
    expect: has.properties({ hasResult: true, called: true }),
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
      return { hasResult: !!result, called: afterAllCalled }
    },
    expect: has.properties({ hasResult: true, called: true }),
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
      return { hasResult: !!result, called: cleanupCalled }
    },
    expect: has.properties({ hasResult: true, called: true }),
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
      return result?.name
    },
    expect: 'named-suite',
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
      return result?.parent
    },
    expect: 'parent-suite',
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
      return result?.pkg
    },
    expect: 'my-pkg-suite',
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
      return result?.duration
    },
    expect: is.string,
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
      return result?.tests?.length
    },
    expect: (v: number | undefined) => is.number(v) && v > 0,
  },
] satisfies TestCase[]
