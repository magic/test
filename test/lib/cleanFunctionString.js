import { cleanFunctionString } from '../../src/lib/index.js'

export default [
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  /** @ts-ignore */
  { fn: () => cleanFunctionString(async t => true), expect: 'true' },
  /** @ts-ignore */
  { fn: () => cleanFunctionString(async t => true), expect: 'true' },

  /** @ts-ignore */
  { fn: () => cleanFunctionString(t => true), expect: 'true' },
  /** @ts-ignore */
  { fn: () => cleanFunctionString(t => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },

  {
    fn: () => cleanFunctionString((async () => true).toString()),
    expect: 'true',
  },
  {
    /** @ts-ignore */
    fn: () => cleanFunctionString((async t => true).toString()),
    expect: 'true',
  },
  {
    /** @ts-ignore */
    fn: () => cleanFunctionString((async t => true).toString()),
    expect: 'true',
  },

  /** @ts-ignore */
  { fn: () => cleanFunctionString((t => true).toString()), expect: 'true' },
  /** @ts-ignore */
  { fn: () => cleanFunctionString((t => true).toString()), expect: 'true' },
  { fn: () => cleanFunctionString((() => true).toString()), expect: 'true' },

  /** @ts-ignore */
  { fn: () => cleanFunctionString(), expect: 'false' },
  { fn: () => cleanFunctionString(1), expect: '1' },
]
