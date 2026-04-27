import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.globalThis,
      expect: is.object,
      info: 'globalThis is an object',
    },
    {
      fn: () => globalThis.globalThis === globalThis,
      expect: true,
      info: 'globalThis equals globalThis',
    },
    {
      fn: () => globalThis.globalThis.document,
      expect: is.object,
      info: 'globalThis.document is accessible',
    },
    {
      fn: () => globalThis.globalThis.fetch,
      expect: is.fn,
      info: 'globalThis.fetch is accessible',
    },
    {
      fn: () => globalThis.globalThis.JSON,
      expect: is.object,
      info: 'globalThis.JSON is accessible',
    },
  ],
}
