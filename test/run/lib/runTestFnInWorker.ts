import { runTestFnInWorker } from '#src/run/lib/runTestFnInWorker.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
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
      return r
    },
    expect: has.properties({
      pass: true,
      result: 2,
      afterError: null,
      afterCleanupError: null,
    }),
    info: 'passing fn returns pass=true with result',
  },
  // fn that fails
  {
    fn: async () => {
      const r = await runTestFnInWorker(makeTest({ fn: () => 1, expect: 2 }), 'key2')
      return r
    },
    expect: has.properties({ pass: false, result: 1, exp: 2 }),
    info: 'failing fn returns pass=false with result and exp',
  },
  // fn returning promise
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: async () => 'done', expect: 'done' }),
        'key3',
      )
      return r
    },
    expect: has.properties({ pass: true, result: 'done' }),
    info: 'async fn is awaited',
  },
  // fn as plain value
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: 'literal' as never, expect: 'literal' }),
        'key4',
      )
      return r
    },
    expect: has.properties({ pass: true, result: 'literal' }),
    info: 'plain value fn returned as-is',
  },
  // fn as promise directly
  {
    fn: async () => {
      const r = await runTestFnInWorker(
        makeTest({ fn: Promise.resolve(7) as never, expect: 7 }),
        'key5',
      )
      return r
    },
    expect: has.properties({ pass: true, result: 7 }),
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
      return r.pass
    },
    expect: false,
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
      return { r, beforeCalled, cleanupCalled }
    },
    expect: has.properties({
      beforeCalled: true,
      cleanupCalled: true,
      r: has.properties({ pass: true, afterCleanupError: null }),
    }),
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
      return r
    },
    expect: has.property('afterCleanupError', (e: unknown) => String(e).includes('before failed')),
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
      return { r, ran }
    },
    expect: has.properties({ ran: true, r: has.properties({ pass: true }) }),
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
      return { r, afterCalled }
    },
    expect: has.properties({
      afterCalled: true,
      r: has.properties({ pass: true, afterError: null }),
    }),
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
      return r
    },
    expect: has.property('afterError', (e: unknown) => String(e).includes('after failed')),
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
      return { count, pass: r.pass, result: r.result }
    },
    expect: (v: { count: number; pass: boolean; result: unknown }) =>
      v.pass === true && v.count === 3 && is.arr(v.result) && v.result.length === 3,
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
      return { count, pass: r.pass }
    },
    expect: has.properties({ count: 2, pass: false }),
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
      return r
    },
    expect: has.properties({
      pass: true,
      afterCleanupError: (e: unknown) => String(e).includes('cleanup failed'),
    }),
    info: 'cleanup error captured but pass stays true',
  },
]

export default tests
