import { runSingleTestFromFileInWorker } from '#src/run/lib/runSingleTestFromFileInWorker.js'
import type { TestCase } from '#src/types.js'
import type { WrappedTest } from '#src/types.js'

const mkTest = (name: string, fn: () => unknown, expect: unknown): WrappedTest =>
  ({ name, fn, expect }) as WrappedTest

const tests: TestCase[] = [
  // array format, valid index
  {
    fn: async () => {
      const tests = [mkTest('t1', () => 1 + 1, 2), mkTest('t2', () => 3, 3)]
      const r = await runSingleTestFromFileInWorker(tests, 0, 'pkg', 'parent', 't1')
      return r.pass === true && r.result === 2 && r.name === 't1'
    },
    expect: true,
    info: 'array format runs test at index 0',
  },
  // array format, second index
  {
    fn: async () => {
      const tests = [mkTest('t1', () => 1, 1), mkTest('t2', () => 5, 99)]
      const r = await runSingleTestFromFileInWorker(tests, 1, 'pkg', 'parent', 't2')
      return r.pass === false && r.result === 5 && r.expect === 99 && r.name === 't2'
    },
    expect: true,
    info: 'array format runs test at index 1 (failing)',
  },
  // object format { tests: [...] }
  {
    fn: async () => {
      const suite = { tests: [mkTest('a', () => 'x', 'x'), mkTest('b', () => 'y', 'y')] }
      const r = await runSingleTestFromFileInWorker(suite, 1, 'pkg', 'parent', 'b')
      return r.pass === true && r.result === 'y' && r.name === 'b'
    },
    expect: true,
    info: 'object { tests: [] } format runs test by index',
  },
  // single test object (no array)
  {
    fn: async () => {
      const single = mkTest('solo', () => 9, 9)
      const r = await runSingleTestFromFileInWorker(single, 0, 'pkg', 'parent', 'solo')
      return r.pass === true && r.result === 9
    },
    expect: true,
    info: 'single test object is used directly',
  },
  // out-of-bounds index -> fail result with key
  {
    fn: async () => {
      const tests = [mkTest('only', () => 1, 1)]
      const r = await runSingleTestFromFileInWorker(tests, 5, 'mypkg', 'myparent', 'ghost')
      return (
        r.pass === false &&
        r.result === undefined &&
        r.name === 'ghost' &&
        r.key === 'mypkg.myparent#ghost'
      )
    },
    expect: true,
    info: 'out-of-bounds index returns fail result with composed key',
  },
  // non-test input -> fail result
  {
    fn: async () => {
      const r = await runSingleTestFromFileInWorker('just a string', 0, 'pkg', '', 'name')
      return r.pass === false && r.result === undefined
    },
    expect: true,
    info: 'non-test input returns fail result',
  },
  // test without name uses provided testName
  {
    fn: async () => {
      const test = { fn: () => 7, expect: 7 } as WrappedTest
      const r = await runSingleTestFromFileInWorker([test], 0, 'p', 'pa', 'givenName')
      return r.name === 'givenName' && r.pass === true
    },
    expect: true,
    info: 'missing test name falls back to provided testName',
  },
  // async fn in test
  {
    fn: async () => {
      const tests = [mkTest('async', async () => 'awaited', 'awaited')]
      const r = await runSingleTestFromFileInWorker(tests, 0, 'pkg', 'parent', 'async')
      return r.pass === true && r.result === 'awaited'
    },
    expect: true,
    info: 'async test fn is awaited',
  },
]

export default tests
