import { testNeedsIsolation } from '../../../src/run/lib/testNeedsIsolation.js'
import type { TestCase } from '../../../src/types.js'

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
] satisfies TestCase[]
