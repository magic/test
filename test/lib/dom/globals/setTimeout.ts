import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.setTimeout,
      expect: is.fn,
      info: 'setTimeout is a function',
    },
    {
      fn: async () => {
        let called = false
        return await new Promise(r =>
          globalThis.setTimeout(() => {
            called = true
            r(called)
          }, 10),
        )
      },
      expect: true,
      info: 'setTimeout calls callback',
    },
    {
      fn: () => {
        const id = globalThis.setTimeout(() => {}, 100)
        return is.object(id) && '_idleTimeout' in id
      },
      expect: true,
      info: 'setTimeout returns a Timeout object',
    },
    {
      fn: () => {
        const id = globalThis.setTimeout(() => {}, 100)
        return globalThis.clearTimeout(id)
      },
      expect: undefined,
      info: 'clearTimeout is callable',
    },
    {
      fn: () => {
        const id = globalThis.setTimeout(() => {}, 100, 'arg1', 'arg2')
        return globalThis.clearTimeout(id)
      },
      expect: undefined,
      info: 'setTimeout passes arguments to callback',
    },
  ],
}
