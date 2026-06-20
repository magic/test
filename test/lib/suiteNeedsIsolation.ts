import {
  suiteNeedsIsolation,
  suiteBeforeAllModifiesGlobalState,
} from '../../src/lib/suiteNeedsIsolation.js'
import type { TestCase } from '../../src/types.js'

export default [
  {
    fn: () => suiteNeedsIsolation({ tests: { nested: { before: () => {} } } }),
    expect: true,
    info: 'detects before in nested tests object',
  },
  {
    fn: () => suiteNeedsIsolation({ tests: { nested: { after: () => {} } } }),
    expect: true,
    info: 'detects after in nested tests object',
  },
  {
    // @ts-expect-error invalid argument
    fn: () => suiteNeedsIsolation('invalid'),
    expect: false,
    info: 'returns false for non-object/array input',
  },
  {
    // @ts-expect-error invalid argument
    fn: () => suiteNeedsIsolation(123),
    expect: false,
    info: 'returns false for number input',
  },
  {
    // @ts-expect-error invalid argument
    fn: () => suiteNeedsIsolation(null),
    expect: false,
    info: 'returns false for null input',
  },
  // Additional hook tests
  {
    fn: () => suiteNeedsIsolation({ tests: [], beforeEach: () => {} }),
    expect: true,
    info: 'detects beforeEach in suite',
  },
  {
    fn: () => suiteNeedsIsolation({ tests: [], beforeAll: () => {} }),
    expect: true,
    info: 'detects beforeAll in suite',
  },
  {
    fn: () => suiteNeedsIsolation({ tests: [], afterAll: () => {} }),
    expect: true,
    info: 'detects afterAll in suite',
  },
  // Nested tests.nested path
  {
    fn: () => suiteNeedsIsolation({ nested: { beforeEach: () => {} } }),
    expect: true,
    info: 'detects beforeEach in nested path',
  },
  {
    fn: () => suiteNeedsIsolation({ nested: { beforeAll: () => {} } }),
    expect: true,
    info: 'detects beforeAll in nested path',
  },
  {
    fn: () => suiteNeedsIsolation({ nested: { afterAll: () => {} } }),
    expect: true,
    info: 'detects afterAll in nested path',
  },
  // suiteBeforeAllModifiesGlobalState tests
  {
    fn: () => suiteBeforeAllModifiesGlobalState({ tests: [] }),
    expect: false,
    info: 'suiteBeforeAllModifiesGlobalState returns false for clean suite',
  },
  {
    fn: () => suiteBeforeAllModifiesGlobalState({ beforeAll: () => {} }),
    expect: false,
    info: 'suiteBeforeAllModifiesGlobalState returns false when beforeAll does not modify globals',
  },
  {
    fn: () => suiteBeforeAllModifiesGlobalState({ beforeAll: () => globalThis.x }),
    expect: true,
    info: 'suiteBeforeAllModifiesGlobalState detects beforeAll modifying globals',
  },
  {
    fn: () => suiteBeforeAllModifiesGlobalState({ tests: { beforeAll: () => globalThis.x } }),
    expect: true,
    info: 'suiteBeforeAllModifiesGlobalState detects nested beforeAll modifying globals',
  },
  // Deeply nested - only tests.tests is handled
  {
    fn: () => suiteNeedsIsolation({ tests: { tests: { before: () => {} } } }),
    expect: true,
    info: 'detects before in nested tests.tests',
  },
] satisfies TestCase[]
