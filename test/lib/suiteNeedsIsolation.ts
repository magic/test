import { suiteNeedsIsolation } from '../../src/lib/suiteNeedsIsolation.js'
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
] satisfies TestCase[]
