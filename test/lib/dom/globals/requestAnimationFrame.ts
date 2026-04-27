import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.requestAnimationFrame,
      expect: is.fn,
      info: 'requestAnimationFrame is a function',
    },
    {
      fn: () => {
        const id = globalThis.requestAnimationFrame(() => {})
        return is.num(id)
      },
      expect: true,
      info: 'requestAnimationFrame returns a number id',
    },
    {
      fn: () => {
        let called = false
        const id = globalThis.requestAnimationFrame(() => {
          called = true
        })
        return called === false && is.num(id)
      },
      expect: true,
      info: 'requestAnimationFrame calls callback asynchronously',
    },
    {
      fn: () => {
        const id = globalThis.requestAnimationFrame(() => {})
        return globalThis.cancelAnimationFrame(id)
      },
      expect: undefined,
      info: 'cancelAnimationFrame is callable',
    },
    {
      fn: () => {
        const id = globalThis.requestAnimationFrame(() => {})
        globalThis.cancelAnimationFrame(id)
        return true
      },
      expect: true,
      info: 'cancelAnimationFrame cancels the animation frame',
    },
  ],
}
