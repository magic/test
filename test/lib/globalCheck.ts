import {
  functionModifiesGlobals,
  testModifiesGlobals,
  suiteModifiesGlobals,
} from '../../src/lib/globalCheck.js'
import type { TestCase, TestCollection } from '../../src/types.d.js'

// Helper to access properties without 'any'
type GlobalAny = Record<string, unknown> & typeof globalThis

export default [
  // functionModifiesGlobals
  {
    fn: () => functionModifiesGlobals(() => {}),
    expect: false,
    info: 'returns false for plain function',
  },
  {
    fn: () => functionModifiesGlobals(() => (globalThis as GlobalAny).x),
    expect: true,
    info: 'detects globalThis access',
  },
  {
    fn: () => functionModifiesGlobals(() => (window as unknown as GlobalAny).x),
    expect: true,
    info: 'detects window access',
  },
  {
    fn: () => functionModifiesGlobals(() => (global as unknown as GlobalAny).x),
    expect: true,
    info: 'detects global access',
  },
  {
    fn: () => functionModifiesGlobals(() => (self as unknown as GlobalAny).x),
    expect: true,
    info: 'detects self access',
  },
  {
    fn: () => functionModifiesGlobals(() => process.env.X),
    expect: true,
    info: 'detects process.env access',
  },
  {
    fn: () => functionModifiesGlobals('not a function'),
    expect: false,
    info: 'returns false for non-function',
  },
  {
    fn: () => functionModifiesGlobals(42),
    expect: false,
    info: 'returns false for number',
  },
  {
    fn: () => functionModifiesGlobals(null),
    expect: false,
    info: 'returns false for null',
  },
  // testModifiesGlobals
  {
    fn: () => testModifiesGlobals({ fn: () => {} }),
    expect: false,
    info: 'testModifiesGlobals returns false for clean test',
  },
  {
    fn: () => testModifiesGlobals({ fn: () => (globalThis as GlobalAny).x }),
    expect: true,
    info: 'testModifiesGlobals detects fn modifying globals',
  },
  {
    fn: () =>
      testModifiesGlobals({
        before: () => {
          void (window as unknown as GlobalAny).x
        },
      }),
    expect: true,
    info: 'testModifiesGlobals detects before modifying globals',
  },
  {
    fn: () =>
      testModifiesGlobals({
        after: () => {
          void (global as unknown as GlobalAny).x
        },
      }),
    expect: true,
    info: 'testModifiesGlobals detects after modifying globals',
  },
  {
    fn: () => testModifiesGlobals({ expect: () => (self as unknown as GlobalAny).x }),
    expect: true,
    info: 'testModifiesGlobals detects expect modifying globals',
  },
  // suiteModifiesGlobals
  {
    fn: () => suiteModifiesGlobals([{ fn: () => {} }]),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean suite',
  },
  {
    fn: () => suiteModifiesGlobals([{ fn: () => (globalThis as GlobalAny).x }]),
    expect: true,
    info: 'suiteModifiesGlobals detects fn modifying globals in array',
  },
  {
    fn: () => suiteModifiesGlobals({ tests: [{ fn: () => {} }] }),
    expect: false,
    info: 'suiteModifiesGlobals returns false for clean object suite',
  },
  {
    fn: () => suiteModifiesGlobals({ beforeAll: () => (window as unknown as GlobalAny).x }),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll modifying globals',
  },
  {
    fn: () => suiteModifiesGlobals({ afterAll: () => (global as unknown as GlobalAny).x }),
    expect: true,
    info: 'suiteModifiesGlobals detects afterAll modifying globals',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        beforeAll: () => {
          void (window as unknown as GlobalAny).x
        },
        tests: { nested: true } as never,
      }),
    expect: true,
    info: 'suiteModifiesGlobals detects beforeAll modifying globals with nested tests',
  },
  // Edge cases
  {
    fn: () => functionModifiesGlobals(() => (globalThis as GlobalAny)['x']),
    expect: true,
    info: 'detects bracket notation globalThis access',
  },
  {
    fn: () => functionModifiesGlobals(() => (globalThis as GlobalAny).process?.env),
    expect: true,
    info: 'detects optional chaining on globalThis',
  },
  // Test recursive suiteModifiesGlobals path (lines 49-50)
  // Note: recursion only happens when tests.tests is an object, not an array
  {
    fn: () =>
      suiteModifiesGlobals({
        tests: {
          beforeAll: () => (globalThis as GlobalAny).x,
        },
      }),
    expect: true,
    info: 'suiteModifiesGlobals detects globals in nested tests.beforeAll',
  },
  {
    fn: () =>
      suiteModifiesGlobals({
        tests: {
          afterAll: () => (globalThis as GlobalAny).x,
        },
      }),
    expect: true,
    info: 'suiteModifiesGlobals detects globals in nested tests.afterAll',
  },
  // Test for object with tests property that's not objectNative
  {
    fn: () => suiteModifiesGlobals({ tests: null as unknown as TestCollection }),
    expect: false,
    info: 'suiteModifiesGlobals handles null tests',
  },
] satisfies TestCase[]
