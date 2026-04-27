import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.sessionStorage,
      expect: is.object,
      info: 'sessionStorage exists',
    },
    {
      fn: () => globalThis.sessionStorage.setItem,
      expect: is.fn,
      info: 'sessionStorage has setItem method',
    },
    {
      fn: () => {
        globalThis.sessionStorage.setItem('test', 'value')
        return globalThis.sessionStorage.getItem('test')
      },
      expect: 'value',
      info: 'sessionStorage.setItem and getItem work',
    },
    {
      fn: () => {
        globalThis.sessionStorage.setItem('test', 'value')
        return globalThis.sessionStorage.removeItem('test')
      },
      expect: undefined,
      info: 'sessionStorage.removeItem works',
    },
    {
      fn: () => {
        globalThis.sessionStorage.clear()
        return globalThis.sessionStorage.length
      },
      expect: 0,
      info: 'sessionStorage.clear works',
    },
  ],
}
