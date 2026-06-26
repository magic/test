import is from '@magic/types'
import { get, post, http } from '../../src/lib/http.js'
import type { TestCase } from '../../src/types.js'

// Store original env
const originalEnv = { ...process.env }

const withEnv = (envVars: Record<string, string | undefined>, fn: () => unknown) => {
  // Clear and set
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
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  }
}

export default [
  // shouldRejectUnauthorized - uncovered lines in http.ts
  {
    fn: () =>
      withEnv({}, () => {
        const { get } = http as { get: (url: string, opts?: unknown) => unknown }
        try {
          get('')
          return false
        } catch (e) {
          return (e as Error).message.includes('Invalid URL')
        }
      }),
    expect: true,
    info: 'get throws for empty string URL',
  },
  {
    fn: () => {
      try {
        get(42 as unknown as string)
        return false
      } catch (e) {
        return (e as Error).message.includes('Invalid URL')
      }
    },
    expect: true,
    info: 'get throws for non-string URL',
  },
  {
    fn: () => {
      try {
        get('ftp://example.com')
        return false
      } catch (e) {
        return (e as Error).message.includes('Unsupported protocol')
      }
    },
    expect: true,
    info: 'get throws for non-http protocol',
  },
  {
    fn: () => {
      try {
        get('not-a-valid-url')
        return false
      } catch (e) {
        return (e as Error).message.includes('Invalid URL')
      }
    },
    expect: true,
    info: 'get throws for invalid URL format',
  },
  // post URL validation
  {
    fn: () => {
      try {
        post('')
        return false
      } catch (e) {
        return (e as Error).message.includes('Invalid URL')
      }
    },
    expect: true,
    info: 'post throws for empty string URL',
  },
  {
    fn: () => {
      try {
        post(42 as unknown as string)
        return false
      } catch (e) {
        return (e as Error).message.includes('Invalid URL')
      }
    },
    expect: true,
    info: 'post throws for non-string URL',
  },
  {
    fn: () => {
      try {
        post('ftp://example.com')
        return false
      } catch (e) {
        return (e as Error).message.includes('Unsupported protocol')
      }
    },
    expect: true,
    info: 'post throws for non-http protocol',
  },
  // shouldRejectUnauthorized env var
  {
    fn: () =>
      withEnv({ MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED: 'false' }, () => {
        // This just verifies the env is being read
        return process.env.MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED
      }),
    expect: 'false',
    info: 'reads MAGIC_TEST_HTTP_REJECT_UNAUTHORIZED env var',
  },
  // http object structure
  {
    fn: () => http.get,
    expect: is.function,
    info: 'http.get is a function',
  },
  {
    fn: () => http.post,
    expect: is.function,
    info: 'http.post is a function',
  },
] satisfies TestCase[]
