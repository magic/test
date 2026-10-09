import { suiteNeedsIsolation } from '#lib/suiteNeedsIsolation.js'
import { walkTests } from '#lib/analysis/testWalker.js'
import type { Test } from '#src/types.js'

export default [
  // Array with plain test (no hooks) - no isolation
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1 }]),
    expect: false,
    info: 'array of plain tests does not need isolation',
  },
  // Array with test that has before hook
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1, before: () => {} }]),
    expect: true,
    info: 'array test with before hook needs isolation',
  },
  // Array with test that has after hook
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1, after: () => {} }]),
    expect: true,
    info: 'array test with after hook needs isolation',
  },
  // Array with test that has beforeEach hook
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1, beforeEach: () => {} }]),
    expect: true,
    info: 'array test with beforeEach hook needs isolation',
  },
  // Array with test that has afterEach hook
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1, afterEach: () => {} }]),
    expect: true,
    info: 'array test with afterEach hook needs isolation',
  },
  // Empty array
  {
    fn: () => suiteNeedsIsolation([]),
    expect: false,
    info: 'empty array does not need isolation',
  },
  // Array where second test has hook
  {
    fn: () => suiteNeedsIsolation([{ fn: () => 1 }, { fn: () => 2, after: () => {} }]),
    expect: true,
    info: 'hook on later test in array needs isolation',
  },
  // Test object with before hook
  {
    fn: () => suiteNeedsIsolation({ fn: () => 1, before: () => {} }),
    expect: true,
    info: 'test object with before hook needs isolation',
  },
  // Test object with only fn
  {
    fn: () => suiteNeedsIsolation({ fn: () => 1 }),
    expect: false,
    info: 'test object without hooks does not need isolation',
  },
  // Nested object suite
  {
    fn: () => {
      const suite = {
        suite1: { fn: () => 1, after: () => {} },
      }
      return suiteNeedsIsolation(suite)
    },
    expect: true,
    info: 'nested suite with hook needs isolation',
  },
  // Nested object suite without hooks
  {
    fn: () => {
      const suite = {
        suite1: { fn: () => 1 },
        suite2: { fn: () => 2 },
      }
      return suiteNeedsIsolation(suite)
    },
    expect: false,
    info: 'nested suites without hooks do not need isolation',
  },
  // Object with tests array inside
  {
    fn: () => {
      const suite = {
        tests: [{ fn: () => 1, before: () => {} }],
      }
      return suiteNeedsIsolation(suite)
    },
    expect: true,
    info: 'object with tests array containing hook needs isolation',
  },
  // Object with nested key
  {
    fn: () => {
      const suite = {
        nested: [{ fn: () => 1, after: () => {} }],
      }
      return suiteNeedsIsolation(suite)
    },
    expect: true,
    info: 'object with nested array containing hook needs isolation',
  },
  // Null/undefined input
  {
    fn: () => suiteNeedsIsolation(null as unknown as Parameters<typeof suiteNeedsIsolation>[0]),
    expect: false,
    info: 'null input does not need isolation',
  },
  // beforeAll/afterAll should not trigger isolation (only before/after/beforeEach/afterEach)
  {
    fn: () => {
      const suite = {
        beforeAll: () => {},
        afterAll: () => {},
        fn: () => 1,
      }
      return suiteNeedsIsolation(suite)
    },
    expect: false,
    info: 'beforeAll/afterAll alone do not need isolation',
  },

  // --- walkTests tests ---
  // walkTests with null
  {
    fn: () => {
      let visited = 0
      // @ts-expect-error null is not a valid Test
      walkTests(null, () => {
        visited++
      })
      return visited === 0
    },
    expect: true,
    info: 'walkTests with null visits nothing',
  },
  // walkTests visits each test in array
  {
    fn: () => {
      const visited: string[] = []
      walkTests(
        [{ fn: () => 1, name: 'a' as never } as never, { fn: () => 2 }] as never,
        (t: { name?: string; fn?: unknown }) => {
          if (t.name === 'a') {
            visited.push('a')
          }
        },
      )
      return visited.length === 1 && visited[0] === 'a'
    },
    expect: true,
    info: 'walkTests visits array elements',
  },
  // walkTests early exit when visitor returns true
  {
    fn: () => {
      let count = 0
      walkTests([{}, {}, {}] as never, () => {
        count++
        return true
      })
      return count === 1
    },
    expect: true,
    info: 'walkTests stops early when visitor returns true',
  },
  // walkTests recurses into test.tests
  {
    fn: () => {
      walkTests([{ fn: () => 1, tests: { inner: { fn: () => 2 } } }] as never, () => {
        // check via nested key name
        return false
      })
      // verify recursion by visiting nested object structure
      const visitedKeys: string[] = []
      walkTests({ top: { deep: { fn: () => 1 } } } as never, t => {
        if (t && 'fn' in (t as object)) {
          visitedKeys.push('leaf')
        }
        return false
      })
      return visitedKeys.includes('leaf')
    },
    expect: true,
    info: 'walkTests recurses into nested keys',
  },
  // walkTests visits object top-level hooks then nested
  {
    fn: () => {
      const visited: string[] = []
      walkTests(
        {
          beforeEach: () => {},
          suite1: { fn: () => 1 },
        } as never,
        t => {
          if (t && 'beforeEach' in (t as object)) {
            visited.push('hooks')
          }
          if (t && 'fn' in (t as object)) {
            visited.push('test')
          }
          return false
        },
      )
      return visited.includes('hooks') && visited.includes('test')
    },
    expect: true,
    info: 'walkTests visits top-level hooks and nested tests',
  },
] satisfies Test[]
