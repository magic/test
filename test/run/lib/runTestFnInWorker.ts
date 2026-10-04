import { runTestFnInWorker } from '#src/run/lib/runTestFnInWorker.js'
import type { TestCase } from '#src/types.js'
import type { WrappedTest } from '#src/types.js'

const makeTest = (overrides: Partial<WrappedTest> = {}): WrappedTest =>
  ({
    name: 'test',
    fn: () => 42,
    expect: 42,
    ...overrides,
  }) as WrappedTest

const tests: TestCase[] = [
  // fn that passes
  {
    fn: async () => {
      const r = await runTestFnInWorker(makeTest({ fn: () => 1 + 1, expect: 2 }), 'key1')
      return (
        r.pass === true && r.result === 2 && r.afterError === null && r.afterCleanupError === null
      )
    },
    expect: true,
    info: 'passing fn returns pass=true with result',
  },
  // fn that fails
  {
    fn: async () => {
      const r = await runTestFnInWorker(makeTest({ fn: () => 1, expect: 2 }), 'key2')
      return r.pass === false && r.result === 1 && r.exp === 2
    },
    expect: true,
    info: 'failing fn returns pass=false with result and exp',
  },
  // fn returning promise
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: async () => 'done', expect: 'done' }),
        'key3',
      )
      return r.pass === true && r.result === 'done'
    },
    expect: true,
    info: 'async fn is awaited',
  },
  // fn as plain value
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: 'literal' as never, expect: 'literal' }),
        'key4',
      )
      return r.pass === true && r.result === 'literal'
    },
    expect: true,
    info: 'plain value fn returned as-is',
  },
  // fn as promise directly
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: Promise.resolve(7) as never, expect: 7 }),
        'key5',
      )
      return r.pass === true && r.result === 7
    },
    expect: true,
    info: 'promise fn awaited directly',
  },
  // fn that throws
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => {
            throw new Error('boom')
          },
          expect: 1,
        }),
        'key6',
      )
      return r.pass === false
    },
    expect: true,
    info: 'throwing fn returns pass=false',
  },
  // before hook runs and cleanup is invoked
  {
    fn: async () => {
      let beforeCalled = false
      let cleanupCalled = false
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 5,
          expect: 5,
          before: () => {
            beforeCalled = true
            return () => {
              cleanupCalled = true
            }
          },
        }),
        'key7',
      )
      return beforeCalled && cleanupCalled && r.pass === true && r.afterCleanupError === null
    },
    expect: true,
    info: 'before hook runs and returned cleanup is invoked',
  },
  // before hook that throws
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 1,
          expect: 1,
          before: () => {
            throw new Error('before failed')
          },
        }),
        'key8',
      )
      return r.afterCleanupError !== null && String(r.afterCleanupError).includes('before failed')
    },
    expect: true,
    info: 'before hook error captured in afterCleanupError',
  },
  // before as promise
  {
    fn: async () => {
      let ran = false
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 2,
          expect: 2,
          before: Promise.resolve().then(() => {
            ran = true
          }) as never,
        }),
        'key9',
      )
      return ran && r.pass === true
    },
    expect: true,
    info: 'promise before is awaited',
  },
  // after hook runs
  {
    fn: async () => {
      let afterCalled = false
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 3,
          expect: 3,
          after: () => {
            afterCalled = true
          },
        }),
        'key10',
      )
      return afterCalled && r.pass === true && r.afterError === null
    },
    expect: true,
    info: 'after hook runs',
  },
  // after hook that throws
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 4,
          expect: 4,
          after: () => {
            throw new Error('after failed')
          },
        }),
        'key11',
      )
      return String(r.afterError).includes('after failed')
    },
    expect: true,
    info: 'after hook error captured in afterError',
  },
  // runs > 1 all passing
  {
    fn: async () => {
      let count = 0
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => {
            count++
            return 1
          },
          expect: 1,
          runs: 3,
        }),
        'key12',
      )
      return r.pass === true && count === 3 && Array.isArray(r.result) && r.result.length === 3
    },
    expect: true,
    info: 'runs=3 executes fn 3 times and collects results',
  },
  // runs > 1 with one failing
  {
    fn: async () => {
      let count = 0
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => {
            count++
            return count
          },
          expect: 1,
          runs: 2,
        }),
        'key13',
      )
      return r.pass === false && count === 2
    },
    expect: true,
    info: 'runs=2 with one failing run returns pass=false',
  },
  // cleanup that throws
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({
          fn: () => 10,
          expect: 10,
          before: () => {
            return () => {
              throw new Error('cleanup failed')
            }
          },
        }),
        'key14',
      )
      return r.pass === true && String(r.afterCleanupError).includes('cleanup failed')
    },
    expect: true,
    info: 'cleanup error captured but pass stays true',
  },
]

export default tests
