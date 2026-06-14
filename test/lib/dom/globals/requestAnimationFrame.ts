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
        return is.object(id) && '_onImmediate' in id
      },
      expect: true,
      info: 'requestAnimationFrame returns an Immediate object',
    },
    {
      fn: async () => {
        let called = false
        globalThis.requestAnimationFrame(() => {
          called = true
        })
        await new Promise(resolve => setImmediate(resolve))
        return called
      },
      expect: true,
      info: 'requestAnimationFrame calls callback asynchronously',
    },
    {
      fn: async () => {
        const id = globalThis.requestAnimationFrame(() => {})
        await new Promise(resolve => setTimeout(resolve, 16))
        return globalThis.cancelAnimationFrame(id)
      },
      expect: undefined,
      info: 'cancelAnimationFrame is callable',
    },
    {
      fn: async () => {
        const id = globalThis.requestAnimationFrame(() => {})
        await new Promise(resolve => setTimeout(resolve, 16))
        globalThis.cancelAnimationFrame(id)
        return true
      },
      expect: true,
      info: 'cancelAnimationFrame cancels the animation frame',
    },
  ],
}
