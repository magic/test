import { stringify } from '../../src/lib/stringify.js'
import type { TestCase } from '../../src/types.ts'

// Store original env
const _originalArgv = [...process.argv]
const originalEnv = { ...process.env }

const withArgv = (args: string[], fn: () => unknown) => {
  const original = [...process.argv]
  process.argv = ['node', 'test', ...args]
  try {
    return fn()
  } finally {
    process.argv = original
  }
}

const withEnv = (envVars: Record<string, string | undefined>, fn: () => unknown) => {
  // Save and clear
  for (const key of Object.keys(process.env)) {
    if (!(key in envVars)) {
      delete process.env[key]
    }
  }
  for (const [key, value] of Object.entries(envVars)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
  try {
    return fn()
  } finally {
    // Restore
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  }
}

export default [
  {
    fn: () => stringify('short'),
    expect: 'short',
    info: 'returns short strings unchanged',
  },
  {
    fn: () => stringify('a'.repeat(100)),
    expect: 'a'.repeat(70),
    info: 'truncates long strings to 70 chars',
  },
  {
    fn: () => stringify(42),
    expect: 42,
    info: 'returns numbers unchanged',
  },
  {
    fn: () => stringify(true),
    expect: true,
    info: 'returns booleans unchanged',
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
  {
    fn: () => stringify([1, 2, 3]),
    expect: [1, 2, 3],
    info: 'processes arrays recursively',
  },
  {
    fn: () => stringify({ a: 1, b: 2 }),
    expect: { a: 1, b: 2 },
    info: 'processes objects recursively',
  },
  {
    fn: () => stringify(() => 'test'),
    expect: "() => 'test'",
    info: 'converts functions to strings',
  },
  {
    fn: () => stringify([1, () => 2, { nested: true }]),
    expect: [1, '() => 2', { nested: true }],
    info: 'handles mixed arrays with functions',
  },
  {
    fn: () => stringify({ fn: () => 'hello', str: 'world' }),
    expect: { fn: "() => 'hello'", str: 'world' },
    info: 'handles mixed objects with functions',
  },
  // Error length tests (lines 28-29 uncovered)
  {
    fn: () => withArgv(['--verbose'], () => stringify('a'.repeat(200))),
    expect: 'a'.repeat(200),
    info: 'no truncation with --verbose flag',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_ERROR_LENGTH: '0' }, () => stringify('a'.repeat(200))),
    expect: 'a'.repeat(200),
    info: 'no truncation when MAGIC_TEST_ERROR_LENGTH is 0',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_ERROR_LENGTH: '50' }, () => stringify('a'.repeat(100))),
    expect: 'a'.repeat(50),
    info: 'respects MAGIC_TEST_ERROR_LENGTH env var',
  },
] satisfies TestCase[]
