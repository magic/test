import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new globalThis.Storage(),
      expect: is.object,
      info: 'Storage is callable with new',
    },
    {
      fn: () => {
        const s = new globalThis.Storage()
        return s.setItem
      },
      expect: is.fn,
      info: 'Storage has setItem method',
    },
    {
      fn: () => {
        const s = new globalThis.Storage()
        s.setItem('key', 'value')
        return s.getItem('key')
      },
      expect: 'value',
      info: 'Storage.setItem and getItem work',
    },
    {
      fn: () => {
        const s = new globalThis.Storage()
        s.setItem('key', 'value')
        return s.removeItem('key')
      },
      expect: undefined,
      info: 'Storage.removeItem works',
    },
    {
      fn: () => {
        const s = new globalThis.Storage()
        s.setItem('key', 'value')
        return s.length
      },
      expect: 1,
      info: 'Storage.length reflects item count',
    },
  ],
}
