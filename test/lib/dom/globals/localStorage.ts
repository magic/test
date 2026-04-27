import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.localStorage,
      expect: is.object,
      info: 'localStorage exists',
    },
    {
      fn: () => globalThis.localStorage.setItem,
      expect: is.fn,
      info: 'localStorage has setItem method',
    },
    {
      fn: () => {
        globalThis.localStorage.setItem('testLocal', 'value')
        return globalThis.localStorage.getItem('testLocal')
      },
      expect: 'value',
      info: 'localStorage.setItem and getItem work',
    },
    {
      fn: () => {
        globalThis.localStorage.setItem('testLocal', 'value')
        return globalThis.localStorage.removeItem('testLocal')
      },
      expect: undefined,
      info: 'localStorage.removeItem works',
    },
    {
      fn: () => {
        globalThis.localStorage.setItem('key1', 'val1')
        globalThis.localStorage.setItem('key2', 'val2')
        return globalThis.localStorage.key(0)
      },
      expect: 'key1',
      info: 'localStorage.key returns key at index',
    },
  ],
}
