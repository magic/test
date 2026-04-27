import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.window,
      expect: is.object,
      info: 'window is an object',
    },
    {
      fn: () => globalThis.window.document,
      expect: is.object,
      info: 'window.document exists',
    },
    {
      fn: () => globalThis.window.navigator,
      expect: is.object,
      info: 'window.navigator exists',
    },
    {
      fn: () => globalThis.window.location,
      expect: is.object,
      info: 'window.location exists',
    },
    {
      fn: () => globalThis.window.history,
      expect: is.object,
      info: 'window.history exists',
    },
  ],
}
