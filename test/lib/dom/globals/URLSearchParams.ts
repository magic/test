import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new URLSearchParams(),
      expect: is.object,
      info: 'URLSearchParams is callable with new',
    },
    {
      fn: () => new URLSearchParams().append,
      expect: is.fn,
      info: 'URLSearchParams has append method',
    },
    {
      fn: () => {
        const p = new URLSearchParams()
        p.append('key', 'value')
        return p.get('key')
      },
      expect: 'value',
      info: 'URLSearchParams.append adds and get retrieves',
    },
    {
      fn: () => new URLSearchParams('?a=1&b=2').get('a'),
      expect: '1',
      info: 'URLSearchParams can be initialized with string',
    },
    {
      fn: () => new URLSearchParams({ a: '1', b: '2' }).get('b'),
      expect: '2',
      info: 'URLSearchParams can be initialized with object',
    },
  ],
}
