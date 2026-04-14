import { suiteNeedsIsolation } from '../../src/lib/suiteNeedsIsolation.js'

export default [
  {
    fn: () => suiteNeedsIsolation({ key: { tests: { nested: { before: () => {} } } } }),
    expect: true,
    info: 'detects before in nested tests object',
  },
  {
    fn: () => suiteNeedsIsolation({ key: { tests: { nested: { after: () => {} } } } }),
    expect: true,
    info: 'detects after in nested tests object',
  },
  {
    // @ts-expect-error invalid argument type for test
    fn: () => suiteNeedsIsolation('invalid'),
    expect: false,
    info: 'returns false for non-object/array input',
  },
  {
    // @ts-expect-error invalid argument type for test
    fn: () => suiteNeedsIsolation(123),
    expect: false,
    info: 'returns false for number input',
  },
  {
    // @ts-expect-error invalid argument type for test
    fn: () => suiteNeedsIsolation(null),
    expect: false,
    info: 'returns false for null input',
  },
]
