import { stringify } from '#lib/stringify.js'
import type { TestCase } from '#src/types.js'
import is from '@magic/types'

const tests: TestCase[] = [
  // Test basic string handling
  {
    fn: () => stringify('hello'),
    expect: 'hello',
    info: 'stringifies plain string',
  },
  // Test string truncation
  {
    fn: () => stringify('x'.repeat(100)),
    expect: 'x'.repeat(70),
    info: 'truncates long strings',
  },
  // Test function conversion
  {
    fn: () => stringify(() => 'test'),
    expect: "() => 'test'",
    info: 'converts function to string',
  },
  // Test array processing
  {
    fn: () => stringify([1, () => 2, { nested: true }]),
    expect: [1, '() => 2', { nested: true }],
    info: 'processes arrays recursively',
  },
  // Test object processing
  {
    fn: () => stringify({ fn: () => 'test', str: 'x'.repeat(100) }),
    expect: { fn: "() => 'test'", str: 'x'.repeat(70) },
    info: 'processes objects recursively with truncation',
  },
  // Test primitive values
  {
    fn: () => stringify(true),
    expect: true,
    info: 'returns boolean unchanged',
  },
  {
    fn: () => stringify(false),
    expect: false,
    info: 'returns false unchanged',
  },
  {
    fn: () => stringify(42),
    expect: 42,
    info: 'returns number unchanged',
  },
  {
    fn: () => stringify(null),
    expect: null,
    info: 'returns null unchanged',
  },
  {
    fn: () => stringify(undefined),
    expect: undefined,
    info: 'returns undefined unchanged',
  },
  // Test nested object with function
  {
    fn: () => {
      const obj = { inner: { fn: () => 'value' } }
      return stringify(obj)
    },
    expect: { inner: { fn: "() => 'value'" } },
    info: 'processes nested object with function',
  },
  // Test empty string
  {
    fn: () => stringify(''),
    expect: '',
    info: 'returns empty string unchanged',
  },
  // Test short string
  {
    fn: () => stringify('short'),
    expect: 'short',
    info: 'returns short string unchanged',
  },
  // Test nested array
  {
    fn: () => stringify([{ fn: () => 'test' }, { num: 42 }]),
    expect: [{ fn: "() => 'test'" }, { num: 42 }],
    info: 'processes nested array',
  },
  // Test error length env var (default 70)
  {
    fn: () => {
      const result = stringify('x'.repeat(80))
      // Should be 70 chars, not 80
      return is.string(result) && result.length === 70
    },
    expect: true,
    info: 'respects default error length limit (70)',
  },
  // Test stringify with array containing function
  {
    fn: () => stringify([(x: number) => x + 1, (y: number) => y * 2]),
    expect: ['(x) => x + 1', '(y) => y * 2'],
    info: 'converts all functions in array to strings',
  },
  // Test stringify with nested object containing array
  {
    fn: () => stringify({ arr: [{ fn: () => 'test' }], num: 42 }),
    expect: { arr: [{ fn: "() => 'test'" }], num: 42 },
    info: 'processes nested object with array and function',
  },
]

export default tests
