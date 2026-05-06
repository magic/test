import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.clearInterval,
      expect: is.fn,
      info: 'clearInterval is a function',
    },
    {
      fn: () => {
        const id = globalThis.setInterval(() => {}, 10000)
        return globalThis.clearInterval(id)
      },
      expect: undefined,
      info: 'clearInterval returns undefined',
    },
    {
      fn: () => {
        return globalThis.clearInterval(0)
      },
      expect: undefined,
      info: 'clearInterval handles id 0',
    },
    {
      fn: () => {
        return globalThis.clearInterval(undefined)
      },
      expect: undefined,
      info: 'clearInterval handles undefined id',
    },
    {
      fn: () => {
        // @ts-expect-error null is not a valid argument in the type system
        return globalThis.clearInterval(null)
      },
      expect: undefined,
      info: 'clearInterval handles null id',
    },
  ],
}
