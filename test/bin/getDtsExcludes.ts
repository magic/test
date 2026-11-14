import { getDtsExcludes } from '#src/bin/unit.js'
import type { TestCase } from '#src/types.js'

// getDtsExcludes reads process.env; tests in a file run in parallel, so
// serialize env mutation with a promise-chain lock.
let chain: Promise<unknown> = Promise.resolve()
const lock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = chain.then(fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

const KEY = 'MAGIC_TEST_EXCLUDE'

const withEnv = (value: string | undefined, fn: () => unknown) =>
  lock(async () => {
    const saved = process.env[KEY]
    if (value === undefined) {
      delete process.env[KEY]
    } else {
      process.env[KEY] = value
    }
    try {
      return fn()
    } finally {
      if (saved === undefined) {
        delete process.env[KEY]
      } else {
        process.env[KEY] = saved
      }
    }
  })

export default [
  {
    fn: () => withEnv(undefined, () => getDtsExcludes()),
    expect: [],
    info: 'absent MAGIC_TEST_EXCLUDE yields no excludes',
  },
  {
    fn: () => withEnv(JSON.stringify(['docs', '**/vendor.d.ts']), () => getDtsExcludes()),
    expect: ['docs', '**/vendor.d.ts'],
    info: 'parses a JSON array of exclude patterns',
  },
  {
    fn: () => withEnv('[]', () => getDtsExcludes()),
    expect: [],
    info: 'empty JSON array yields no excludes',
  },
  {
    before: () => {
      const oldWarn = console.warn
      console.warn = () => {}

      return () => {
        console.warn = oldWarn
      }
    },
    fn: () => withEnv('not-json', () => getDtsExcludes()),
    expect: [],
    info: 'invalid JSON falls back to no excludes',
  },
  {
    fn: () => withEnv(JSON.stringify('docs'), () => getDtsExcludes()),
    expect: [],
    info: 'JSON scalar (not an array) yields no excludes',
  },
  {
    fn: () => withEnv(JSON.stringify(['docs', 42, null]), () => getDtsExcludes()),
    expect: ['docs', '42', 'null'],
    info: 'array entries are coerced to strings',
  },
] satisfies TestCase[]
