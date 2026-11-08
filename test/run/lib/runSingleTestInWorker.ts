import { runSingleTestInWorker } from '#src/run/lib/runSingleTestInWorker.js'
import { has } from '#lib/has.js'
import is from '@magic/types'
import type { Test } from '#src/types.js'

export default [
  // test without fn -> fail result
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'nofn', expect: 1, pkg: '@magic/test', parent: '@magic/test' },
        'k',
        'pkg',
        'parent',
        'nofn',
      )
      return r
    },
    expect: has.properties({ pass: false, result: undefined, msg: '' }),
    info: 'test without fn returns fail result with empty msg',
  },
  // passing test
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'ok', fn: () => 1 + 1, expect: 2, pkg: '@magic/test', parent: '@magic/test' },
        'k',
        'pkg',
        'parent',
        'ok',
      )
      return r
    },
    expect: has.properties({ pass: true, result: 2, name: 'ok' }),
    info: 'passing test returns pass=true with result',
  },
  // failing test
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'bad', fn: () => 1, expect: 99, pkg: '@magic/test', parent: '@magic/test' },
        'k',
        'pkg',
        'parent',
        'bad',
      )
      return r
    },
    expect: has.properties({ pass: false, result: 1, expect: 99 }),
    info: 'failing test returns pass=false with result and expect',
  },
  // msg is a cleaned function string
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'msg', fn: () => 5, expect: 5, pkg: '@magic/test', parent: '@magic/test' },
        'k',
        'pkg',
        'parent',
        'msg',
      )
      return r.msg
    },
    expect: [is.str, has.matches(/./)],
    info: 'msg is a non-empty cleaned function string',
  },
  // name/parent/pkg are propagated
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'fields', fn: () => 1, expect: 1, pkg: '@magic/test', parent: '@magic/test' },
        'the-key',
        'mypkg',
        'myparent',
        'theName',
      )
      return r
    },
    expect: has.properties({ name: 'theName', parent: 'myparent', pkg: 'mypkg', key: 'the-key' }),
    info: 'name, parent, pkg, and key are propagated to result',
  },
  // empty parent defaults to empty string
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        { name: 'noparent', fn: () => 1, expect: 1, pkg: '@magic/test', parent: '@magic/test' },
        'k',
        'pkg',
        '',
        'noparent',
      )
      return r.parent
    },
    expect: '',
    info: 'empty testParent becomes empty string in result',
  },
  // info is propagated
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        {
          name: 'info',
          fn: () => 1,
          expect: 1,
          info: 'my info',
          pkg: '@magic/test',
          parent: '@magic/test',
        },
        'k',
        'pkg',
        'parent',
        'info',
      )
      return r.info
    },
    expect: 'my info',
    info: 'info field is propagated to result',
  },
  // async fn
  {
    fn: async () => {
      const r = await runSingleTestInWorker(
        {
          name: 'async',
          fn: async () => 'done',
          expect: 'done',
          pkg: '@magic/test',
          parent: '@magic/test',
        },
        'k',
        'pkg',
        'parent',
        'async',
      )
      return r
    },
    expect: has.properties({ pass: true, result: 'done' }),
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
          pkg: '@magic/test',
          parent: '@magic/test',
        },
        'k',
        'pkg',
        'parent',
        'throw',
      )
      return r.pass
    },
    expect: false,
    info: 'throwing fn yields pass=false without throwing',
  },
] satisfies Test[]
