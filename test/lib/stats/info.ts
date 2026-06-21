import { info } from '../../../src/lib/stats/info.js'
import { createStore } from '../../../src/lib/store.js'
import type { TestCase, TestResult } from '../../../src/types.js'

export default [
  // Empty suites
  {
    fn: () => {
      const store = createStore()
      return info([], store, false)
    },
    expect: true,
    info: 'empty suites array returns true',
  },
  // Suites with no results
  {
    fn: () => {
      const store = createStore()
      return info([{ name: 'test.ts' }], store, false)
    },
    expect: true,
    info: 'suite without tests returns true',
  },
  // Suite with tests but no results in store
  {
    fn: () => {
      const store = createStore()
      const suites = [
        {
          name: 'test.ts',
          tests: [
            {
              pass: true,
              result: 1,
              expString: '1',
              key: 'test.ts',
              msg: 'equal',
            } as TestResult,
          ],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'tests without results data returns true',
  },
  // Passing test
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 1, pass: 1 },
          'test.ts': { all: 1, pass: 1 },
        },
      })
      const suites = [
        {
          name: 'test.ts',
          tests: [
            {
              pass: true,
              result: 1,
              expString: '1',
              key: 'test.ts',
              msg: 'equal',
            } as TestResult,
          ],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'passing test returns true',
  },
  // Failing test
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 1, pass: 0 },
          'test.ts': { all: 1, pass: 0 },
        },
      })
      const suites = [
        {
          name: 'test.ts',
          tests: [
            {
              pass: false,
              result: 1,
              expString: '2',
              key: 'test.ts',
              msg: 'not deep equal',
              info: 'values differ',
            } as TestResult,
          ],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'failing test returns true',
  },
  // Multiple suites
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 4, pass: 3 },
          'suite1.ts': { all: 2, pass: 2 },
          'suite2.ts': { all: 2, pass: 1 },
        },
      })
      const suites = [
        {
          name: 'suite1.ts',
          tests: [
            { pass: true, result: 1, expString: '1', key: 'suite1.ts', msg: '' } as TestResult,
          ],
        },
        {
          name: 'suite2.ts',
          tests: [
            { pass: false, result: 1, expString: '2', key: 'suite2.ts', msg: '' } as TestResult,
          ],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'multiple suites returns true',
  },
  // Suite with duration
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 1, pass: 1 },
          'test.ts': { all: 1, pass: 1 },
        },
      })
      const suites = [
        {
          name: 'test.ts',
          duration: '100ms',
          tests: [{ pass: true, result: 1, expString: '1', key: 'test.ts', msg: '' } as TestResult],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'suite with duration string works',
  },
  // Null suite in array
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 1, pass: 1 },
        },
      })
      const suites = [
        null,
        {
          name: 'test.ts',
          tests: [{ pass: true, result: 1, expString: '1', key: 'test.ts', msg: '' } as TestResult],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'null suite in array is skipped',
  },
  // Test with non-matching key (nested)
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 1, pass: 1 },
          'parent.ts': { all: 1, pass: 1 },
        },
      })
      const suites = [
        {
          name: 'parent.ts',
          tests: [
            {
              pass: true,
              result: 1,
              expString: '1',
              key: 'parent.ts/nested',
              msg: '',
            } as TestResult,
          ],
        },
      ]
      return info(suites, store, false)
    },
    expect: true,
    info: 'test with nested key is skipped for suite level',
  },
  // Zero tests edge case
  {
    fn: () => {
      const store = createStore()
      store.set({
        results: {
          __PACKAGE_ROOT__: { all: 0, pass: 0 },
        },
      })
      return info([], store, false)
    },
    expect: true,
    info: 'zero tests handled gracefully',
  },
] satisfies TestCase[]
