import { cleanFunctionString } from '../../src/lib/cleanFunctionString.js'
import type { TestCase } from '../../src/types.js'

export default [
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  { fn: () => cleanFunctionString(async () => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },
  { fn: () => cleanFunctionString(() => true), expect: 'true' },
  {
    fn: () => cleanFunctionString((async () => true).toString()),
    expect: 'true',
  },
  {
    fn: () => cleanFunctionString((async () => true).toString()),
    expect: 'true',
  },
  {
    fn: () => cleanFunctionString((async () => true).toString()),
    expect: 'true',
  },
  { fn: cleanFunctionString(() => true).toString(), expect: 'true' },
  { fn: cleanFunctionString(() => true).toString(), expect: 'true' },
  { fn: cleanFunctionString((() => true).toString()), expect: 'true' },
  { fn: cleanFunctionString(undefined), expect: 'false' },
  { fn: cleanFunctionString(1), expect: '1' },
] satisfies TestCase[]
