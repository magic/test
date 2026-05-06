import { handleSuiteHooks } from '../../../src/run/lib/handleSuiteHooks.js'
import type { TestCase } from '../../../src/types.js'

const cleanup = () => 'cleanup-result'

export default [
  {
    fn: async () => handleSuiteHooks({}),
    expect: { afterAllCleanup: () => {} },
    info: 'returns empty cleanup for empty object',
  },
  {
    fn: async () => handleSuiteHooks({ beforeAll: undefined }),
    expect: { afterAllCleanup: () => {} },
    info: 'returns empty cleanup for undefined beforeAll',
  },
  {
    fn: async () => {
      return handleSuiteHooks({
        beforeAll: () => cleanup,
      })
    },
    expect: { afterAllCleanup: cleanup },
    info: 'returns cleanup function from beforeAll',
  },
  {
    fn: async () =>
      handleSuiteHooks({
        beforeAll: async () => {},
      }),
    expect: { afterAllCleanup: () => {} },
    info: 'handles async beforeAll returning undefined',
  },
  {
    fn: async () =>
      handleSuiteHooks({
        beforeAll: () => Promise.resolve(() => {}),
      }),
    expect: (r: { afterAllCleanup: () => unknown }) => typeof r.afterAllCleanup === 'function',
    info: 'handles async beforeAll returning cleanup',
  },
  {
    // @ts-expect-error invalid argument
    fn: async () => handleSuiteHooks(null),
    expect: { afterAllCleanup: () => {} },
    info: 'returns empty cleanup for null',
  },
  {
    // @ts-expect-error invalid argument
    fn: async () => handleSuiteHooks(undefined),
    expect: { afterAllCleanup: () => {} },
    info: 'returns empty cleanup for undefined',
  },
] satisfies TestCase[]
