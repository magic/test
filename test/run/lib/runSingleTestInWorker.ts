import { runSingleTestInWorker } from '#src/run/lib/runSingleTestInWorker.js'
import type { TestCase } from '#src/types.js'
import type { WrappedTest } from '#src/types.js'

const tests: TestCase[] = [
  // test without fn -> fail result
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'nofn', expect: 1 } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'nofn',
      )
      return r.pass === false && r.result === undefined && r.msg === ''
    },
    expect: true,
    info: 'test without fn returns fail result with empty msg',
  },
  // passing test
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'ok', fn: () => 1 + 1, expect: 2 } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'ok',
      )
      return r.pass === true && r.result === 2 && r.name === 'ok'
    },
    expect: true,
    info: 'passing test returns pass=true with result',
  },
  // failing test
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'bad', fn: () => 1, expect: 99 } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'bad',
      )
      return r.pass === false && r.result === 1 && r.expect === 99
    },
    expect: true,
    info: 'failing test returns pass=false with result and expect',
  },
  // msg is a cleaned function string
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'msg', fn: () => 5, expect: 5 } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'msg',
      )
      return typeof r.msg === 'string' && r.msg.length > 0
    },
    expect: true,
    info: 'msg is a non-empty cleaned function string',
  },
  // name/parent/pkg are propagated
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'fields', fn: () => 1, expect: 1 } as WrappedTest,
        'the-key',
        'mypkg',
        'myparent',
        'theName',
      )
      return (
        r.name === 'theName' && r.parent === 'myparent' && r.pkg === 'mypkg' && r.key === 'the-key'
      )
    },
    expect: true,
    info: 'name, parent, pkg, and key are propagated to result',
  },
  // empty parent defaults to empty string
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'noparent', fn: () => 1, expect: 1 } as WrappedTest,
        'k',
        'pkg',
        '',
        'noparent',
      )
      return r.parent === ''
    },
    expect: true,
    info: 'empty testParent becomes empty string in result',
  },
  // info is propagated
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'info', fn: () => 1, expect: 1, info: 'my info' } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'info',
      )
      return r.info === 'my info'
    },
    expect: true,
    info: 'info field is propagated to result',
  },
  // async fn
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'async', fn: async () => 'done', expect: 'done' } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'async',
      )
      return r.pass === true && r.result === 'done'
    },
    expect: true,
    info: 'async fn is awaited',
  },
  // throwing fn returns pass=false (not thrown)
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        {
          name: 'throw',
          fn: () => {
            throw new Error('boom')
          },
          expect: 1,
        } as WrappedTest,
        'k',
        'pkg',
        'parent',
        'throw',
      )
      return r.pass === false
    },
    expect: true,
    info: 'throwing fn yields pass=false without throwing',
  },
]

export default tests
