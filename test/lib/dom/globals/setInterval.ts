import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.setInterval,
      expect: is.fn,
      info: 'setInterval is a function',
    },
    {
      fn: async () => {
        let count = 0
        await new Promise(r => {
          setTimeout(() => {
            const id = globalThis.setInterval(() => {
              count++
            }, 10)
            r(true)

            globalThis.clearInterval(id)
          }, 105)
        })

        return count
      },
      expect: 10,
      info: 'setInterval returns a number id',
    },
    {
      fn: () => {
        const id = globalThis.setInterval(() => {}, 100)
        return globalThis.clearInterval(id)
      },
      expect: undefined,
      info: 'clearInterval is callable',
    },
    {
      fn: async () => {
        const id = globalThis.setInterval(() => {}, 10)
        globalThis.clearInterval(id)
        return id
      },
      expect: is.num,
      info: 'setInterval id is a number',
    },
    {
      fn: () => {
        const id = globalThis.setInterval(() => {}, 100, 'arg1')
        return globalThis.clearInterval(id)
      },
      expect: undefined,
      info: 'setInterval passes arguments to callback',
    },
  ],
}
