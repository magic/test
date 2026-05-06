import { hasTestProperties } from '../../../src/run/lib/hasTestProperties.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => hasTestProperties({ fn: () => {} }),
    expect: true,
    info: 'returns true for object with fn',
  },
  {
    fn: () => hasTestProperties({ tests: [] }),
    expect: true,
    info: 'returns true for object with tests',
  },
  {
    fn: () => hasTestProperties({ fn: () => {}, tests: [] }),
    expect: true,
    info: 'returns true for object with both fn and tests',
  },
  {
    fn: () => hasTestProperties({ name: 'test' }),
    expect: false,
    info: 'returns false for object without fn or tests',
  },
  {
    fn: () => hasTestProperties(null),
    expect: false,
    info: 'returns false for null',
  },
  {
    fn: () => hasTestProperties(undefined),
    expect: false,
    info: 'returns false for undefined',
  },
  {
    fn: () => hasTestProperties('string'),
    expect: false,
    info: 'returns false for string',
  },
  {
    fn: () => hasTestProperties(123),
    expect: false,
    info: 'returns false for number',
  },
  {
    fn: () => hasTestProperties([]),
    expect: false,
    info: 'returns false for array',
  },
  {
    fn: () => hasTestProperties(() => {}),
    expect: false,
    info: 'returns false for function',
  },
] satisfies TestCase[]
