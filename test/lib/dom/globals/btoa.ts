import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.btoa,
      expect: is.fn,
      info: 'btoa is a function',
    },
    {
      fn: () => globalThis.btoa('hello'),
      expect: 'aGVsbG8=',
      info: 'btoa encodes to base64',
    },
    {
      fn: () => globalThis.btoa('world'),
      expect: 'd29ybGQ=',
      info: 'btoa encodes another string',
    },
    {
      fn: () => {
        try {
          globalThis.btoa('hello')
          return true
        } catch {
          return false
        }
      },
      expect: true,
      info: 'btoa works with ascii string',
    },
    {
      fn: () => globalThis.btoa(''),
      expect: '',
      info: 'btoa handles empty string',
    },
  ],
}
