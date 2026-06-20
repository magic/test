import { env } from '../../src/lib/env.js'
import type { TestCase } from '../../src/types.js'

// Store original env
const originalEnv = { ...process.env }
const originalArgv = [...process.argv]

// Helper to temporarily modify env
const withEnv = (envVars: Record<string, string | undefined>, fn: () => unknown) => {
  const keysToDelete = Object.keys(process.env).filter(k => !(k in envVars))
  const originalValues: Record<string, string | undefined> = {}

  // Save original values
  for (const key of keysToDelete) {
    originalValues[key] = process.env[key]
    delete process.env[key]
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
    for (const key of keysToDelete) {
      if (originalValues[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = originalValues[key]
      }
    }
    for (const key of Object.keys(envVars)) {
      if (originalEnv[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = originalEnv[key]
      }
    }
  }
}

const withArgv = (args: string[], fn: () => unknown) => {
  const original = [...process.argv]
  process.argv = ['node', 'test', ...args]
  try {
    return fn()
  } finally {
    process.argv = original
  }
}

export default [
  // isNodeProd
  {
    fn: () => withEnv({ NODE_ENV: 'production' }, () => env.isNodeProd()),
    expect: true,
    info: 'isNodeProd returns true for production',
  },
  {
    fn: () => withEnv({ NODE_ENV: 'development' }, () => env.isNodeProd()),
    expect: false,
    info: 'isNodeProd returns false for development',
  },
  {
    fn: () => withEnv({ NODE_ENV: 'test' }, () => env.isNodeProd()),
    expect: false,
    info: 'isNodeProd returns false for test',
  },
  // isNodeDev
  {
    fn: () => withEnv({ NODE_ENV: 'development' }, () => env.isNodeDev()),
    expect: true,
    info: 'isNodeDev returns true for development',
  },
  {
    fn: () => withEnv({ NODE_ENV: 'production' }, () => env.isNodeDev()),
    expect: false,
    info: 'isNodeDev returns false for production',
  },
  // isProd
  {
    fn: () => withArgv(['-p'], () => env.isProd()),
    expect: true,
    info: 'isProd returns true with -p flag',
  },
  {
    fn: () => withArgv([], () => env.isProd()),
    expect: false,
    info: 'isProd returns false without -p flag',
  },
  // isVerbose
  {
    fn: () => withArgv(['--verbose'], () => env.isVerbose()),
    expect: true,
    info: 'isVerbose returns true with --verbose flag',
  },
  {
    fn: () => withArgv(['-v'], () => env.isVerbose()),
    expect: false,
    info: 'isVerbose returns false with -v flag',
  },
  // getErrorLength - uncovered branches lines 31-32
  {
    fn: () => withEnv({}, () => withArgv([], () => env.getErrorLength())),
    expect: undefined,
    info: 'getErrorLength returns undefined when env var unset and not verbose',
  },
  {
    fn: () => withEnv({}, () => withArgv(['--verbose'], () => env.getErrorLength())),
    expect: 0,
    info: 'getErrorLength returns 0 when verbose and env var unset',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_ERROR_LENGTH: '100' }, () => env.getErrorLength()),
    expect: 100,
    info: 'getErrorLength parses numeric env var',
  },
  {
    fn: () => withEnv({ MAGIC_TEST_ERROR_LENGTH: '0' }, () => env.getErrorLength()),
    expect: 0,
    info: 'getErrorLength handles zero',
  },
  {
    fn: () =>
      withEnv({ MAGIC_TEST_ERROR_LENGTH: 'invalid' }, () => {
        const result = env.getErrorLength()
        return Number.isNaN(result)
      }),
    expect: true,
    info: 'getErrorLength returns NaN for invalid string',
  },
] satisfies TestCase[]
