import { cleanFunctionString } from '../../src/lib/cleanFunctionString.js'

const cfs = cleanFunctionString as any

export default [
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  { fn: () => cleanFunctionString(async (t: unknown) => true), expect: 'true' },
  { fn: () => cleanFunctionString(async (t: unknown) => true), expect: 'true' },
  { fn: () => cleanFunctionString((t: unknown) => true), expect: 'true' },
  { fn: () => cleanFunctionString((t: unknown) => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },
  {
    fn: () => cleanFunctionString((async () => true).toString()),
    expect: 'true',
  },
  {
    fn: () => cleanFunctionString((async (t: unknown) => true).toString()),
    expect: 'true',
  },
  {
    fn: () => cleanFunctionString((async (t: unknown) => true).toString()),
    expect: 'true',
  },
  { fn: cfs((t: unknown) => true).toString(), expect: 'true' },
  { fn: cfs((t: unknown) => true).toString(), expect: 'true' },
  { fn: cleanFunctionString((() => true).toString()), expect: 'true' },
  { fn: cfs(), expect: 'false' },
  { fn: cleanFunctionString(1), expect: '1' },
]
