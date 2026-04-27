import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.history,
      expect: is.object,
      info: 'history is an object',
    },
    {
      fn: () => globalThis.history.pushState,
      expect: is.fn,
      info: 'history.pushState is a function',
    },
    {
      fn: () => globalThis.history.replaceState,
      expect: is.fn,
      info: 'history.replaceState is a function',
    },
    {
      fn: () => globalThis.history.back,
      expect: is.fn,
      info: 'history.back is a function',
    },
    {
      fn: () => globalThis.history.forward,
      expect: is.fn,
      info: 'history.forward is a function',
    },
  ],
}
