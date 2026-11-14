import { testNeedsIsolation } from '#src/run/lib/testNeedsIsolation.js'
import type { TestCase } from '#src/types.js'

export default [
  {
    fn: () => testNeedsIsolation({ name: 'test', pkg: 'pkg', parent: 'parent', fn: () => {} }),
    expect: false,
    info: 'returns false for simple test function',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        component: './Component.svelte',
      }),
    expect: true,
    info: 'returns true for test with component',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        before: () => {},
      }),
    expect: true,
    info: 'returns true for test with before hook',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        after: () => {},
      }),
    expect: true,
    info: 'returns true for test with after hook',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        fn: 'string value',
      }),
    expect: false,
    info: 'returns false for string fn (not function)',
  },
  {
    fn: () =>
      testNeedsIsolation({ name: 'test', pkg: 'pkg', parent: 'parent', fn: () => {} }, {
        beforeEach: () => {},
      } as never),
    expect: true,
    info: 'returns true when the suite has a beforeEach hook',
  },
  {
    fn: () =>
      testNeedsIsolation({ name: 'test', pkg: 'pkg', parent: 'parent', fn: () => {} }, {
        afterEach: () => {},
      } as never),
    expect: true,
    info: 'returns true when the suite has an afterEach hook',
  },
  {
    fn: () =>
      testNeedsIsolation({ name: 'test', pkg: 'pkg', parent: 'parent', fn: () => {} }, {
        beforeAll: () => {},
        afterAll: () => {},
      } as never),
    expect: false,
    info: 'returns false when the suite only has beforeAll/afterAll (no per-test hooks)',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        fn: () => {},
        __isolate: true,
      } as never),
    expect: true,
    info: 'returns true for explicit __isolate: true',
  },
  {
    fn: () =>
      testNeedsIsolation({
        name: 'test',
        pkg: 'pkg',
        parent: 'parent',
        fn: () => {},
        __isolate: false,
      } as never),
    expect: false,
    info: 'returns false for explicit __isolate: false',
  },
] satisfies TestCase[]
