import { runSingleTestFromFileInWorker } from '#src/run/lib/runSingleTestFromFileInWorker.js'
import { has } from '#lib/has.js'
import type { TestCase } from '#src/types.js'
import type { WrappedTest } from '#src/types.js'

const mkTest = (name: string, fn: () => unknown, expect: unknown): WrappedTest => ({
  name,
  fn,
  expect,
  pkg: '@magic/test',
  parent: '@magic/test',
})

const tests: TestCase[] = [
  // array format, valid index
  {
    fn: async () => {
      const tests = [mkTest('t1', () => 1 + 1, 2), mkTest('t2', () => 3, 3)]
      const r = await runSingleTestFromFileInWorker(tests, 0, 'pkg', 'parent', 't1')
      return r
    },
    expect: has.properties({ pass: true, result: 2, name: 't1' }),
    info: 'array format runs test at index 0',
  },
  // array format, second index
  {
    fn: async () => {
      const tests = [mkTest('t1', () => 1, 1), mkTest('t2', () => 5, 99)]
      const r = await runSingleTestFromFileInWorker(tests, 1, 'pkg', 'parent', 't2')
      return r
    },
    expect: has.properties({ pass: false, result: 5, expect: 99, name: 't2' }),
    info: 'array format runs test at index 1 (failing)',
  },
  // object format { tests: [...] }
  {
    fn: async () => {
      const suite = { tests: [mkTest('a', () => 'x', 'x'), mkTest('b', () => 'y', 'y')] }
      const r = await runSingleTestFromFileInWorker(suite, 1, 'pkg', 'parent', 'b')
      return r
    },
    expect: has.properties({ pass: true, result: 'y', name: 'b' }),
    info: 'object { tests: [] } format runs test by index',
  },
  // single test object (no array)
  {
    fn: async () => {
      const single = mkTest('solo', () => 9, 9)
      const r = await runSingleTestFromFileInWorker(single, 0, 'pkg', 'parent', 'solo')
      return r
    },
    expect: has.properties({ pass: true, result: 9 }),
    info: 'single test object is used directly',
  },
  // out-of-bounds index -> fail result with key
  {
    fn: async () => {
      const tests = [mkTest('only', () => 1, 1)]
      const r = await runSingleTestFromFileInWorker(tests, 5, 'mypkg', 'myparent', 'ghost')
      return r
    },
    expect: has.properties({
      pass: false,
      result: undefined,
      name: 'ghost',
      key: 'mypkg.myparent#ghost',
    }),
    info: 'out-of-bounds index returns fail result with composed key',
  },
  // non-test input -> fail result
  {
    fn: async () => {
      const r = await runSingleTestFromFileInWorker('just a string', 0, 'pkg', '', 'name')
      return r
    },
    expect: has.properties({ pass: false, result: undefined }),
    info: 'non-test input returns fail result',
  },
  // test without name uses provided testName
  {
    fn: async () => {
      const test = { fn: () => 7, expect: 7, pkg: '@magic/test', parent: '@magic/test' }
      const r = await runSingleTestFromFileInWorker([test], 0, 'p', 'pa', 'givenName')
      return r
    },
    expect: has.properties({ name: 'givenName', pass: true }),
    info: 'missing test name falls back to provided testName',
  },
  // async fn in test
  {
    fn: async () => {
      const tests = [mkTest('async', async () => 'awaited', 'awaited')]
      const r = await runSingleTestFromFileInWorker(tests, 0, 'pkg', 'parent', 'async')
      return r
    },
    expect: has.properties({ pass: true, result: 'awaited' }),
    info: 'async test fn is awaited',
  },
]

export default tests
