import is from '@magic/types'
import { has } from '../../../src/index.js'
import { handleSuiteHooks } from '../../../src/run/lib/handleSuiteHooks.js'
import type { TestCase } from '../../../src/types.js'

const cleanup = () => 'cleanup-result'

export default [
  {
    fn: () => handleSuiteHooks({}),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'returns empty cleanup for empty object',
  },
  {
    fn: () => handleSuiteHooks({ beforeAll: undefined }),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'returns empty cleanup for undefined beforeAll',
  },
  {
    fn: () => {
      return handleSuiteHooks({
        beforeAll: () => cleanup,
      })
    },
    expect: { afterAllCleanup: cleanup },
    info: 'returns cleanup function from beforeAll',
  },
  {
    fn: () =>
      handleSuiteHooks({
        beforeAll: async () => {},
      }),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'handles async beforeAll returning undefined',
  },
  {
    fn: () =>
      handleSuiteHooks({
        beforeAll: () => Promise.resolve(() => {}),
      }),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'handles async beforeAll returning cleanup',
  },
  {
    // @ts-expect-error invalid argument
    fn: () => handleSuiteHooks(null),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'returns empty cleanup for null',
  },
  {
    // @ts-expect-error invalid argument
    fn: () => handleSuiteHooks(undefined),
    expect: has.property('afterAllCleanup', is.fn),
    info: 'returns empty cleanup for undefined',
  },
] satisfies TestCase[]
