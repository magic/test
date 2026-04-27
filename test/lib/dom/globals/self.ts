import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.self,
      expect: is.object,
      info: 'self is an object',
    },
    {
      fn: () => globalThis.self.document,
      expect: is.object,
      info: 'self.document exists',
    },
    {
      fn: () => globalThis.self.window,
      expect: is.object,
      info: 'self.window exists',
    },
    {
      fn: () => globalThis.self.navigator,
      expect: is.object,
      info: 'self.navigator exists',
    },
    {
      fn: () => globalThis.self === globalThis.window,
      expect: true,
      info: 'self equals window',
    },
  ],
}
