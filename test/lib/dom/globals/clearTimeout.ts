import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.clearTimeout,
      expect: is.fn,
      info: 'clearTimeout is a function',
    },
    {
      fn: () => {
        const id = globalThis.setTimeout(() => {}, 10000)
        return globalThis.clearTimeout(id)
      },
      expect: undefined,
      info: 'clearTimeout returns undefined',
    },
    {
      fn: () => {
        return globalThis.clearTimeout(0)
      },
      expect: undefined,
      info: 'clearTimeout handles id 0',
    },
    {
      fn: () => {
        return globalThis.clearTimeout(undefined)
      },
      expect: undefined,
      info: 'clearTimeout handles undefined id',
    },
    {
      fn: () => {
        return globalThis.clearTimeout(null)
      },
      expect: undefined,
      info: 'clearTimeout handles null id',
    },
  ],
}
