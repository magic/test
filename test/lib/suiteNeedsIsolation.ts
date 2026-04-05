import is from '@magic/types'
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
    fn: () => suiteNeedsIsolation('invalid' as any),
    expect: false,
    info: 'returns false for non-object/array input',
  },
  {
    fn: () => suiteNeedsIsolation(123 as any),
    expect: false,
    info: 'returns false for number input',
  },
  {
    fn: () => suiteNeedsIsolation(null as any),
    expect: false,
    info: 'returns false for null input',
  },
]
