import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.cancelAnimationFrame,
      expect: is.fn,
      info: 'cancelAnimationFrame is a function',
    },
    {
      fn: () => {
        const id = globalThis.requestAnimationFrame(() => {})
        return globalThis.cancelAnimationFrame(id)
      },
      expect: undefined,
      info: 'cancelAnimationFrame returns undefined',
    },
    {
      fn: () => {
        return globalThis.cancelAnimationFrame(0)
      },
      expect: undefined,
      info: 'cancelAnimationFrame handles id 0',
    },
    {
      fn: () => {
        return globalThis.cancelAnimationFrame(undefined)
      },
      expect: undefined,
      info: 'cancelAnimationFrame handles undefined id',
    },
    {
      fn: () => {
        return globalThis.cancelAnimationFrame(null)
      },
      expect: undefined,
      info: 'cancelAnimationFrame handles null id',
    },
  ],
}
