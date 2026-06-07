import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.queueMicrotask,
      expect: is.fn,
      info: 'queueMicrotask is a function',
    },
    {
      fn: async () => {
        let called = false
        globalThis.queueMicrotask(() => {
          called = true
        })
        await Promise.resolve()
        return called
      },
      expect: true,
      info: 'queueMicrotask calls the callback',
    },
    {
      fn: async () => {
        let order = 0
        let microtaskOrder = 0
        order = 1
        globalThis.queueMicrotask(() => {
          microtaskOrder = order
        })
        await Promise.resolve()
        return microtaskOrder
      },
      expect: 1,
      info: 'queueMicrotask runs microtask synchronously after sync code',
    },
    {
      fn: async () => {
        let result = 0
        globalThis.queueMicrotask(() => {
          result = 42
        })
        await Promise.resolve()
        return result
      },
      expect: 42,
      info: 'queueMicrotask callback can modify outer scope',
    },
    {
      fn: () => {
        globalThis.queueMicrotask(function () {})
        return true
      },
      expect: true,
      info: 'queueMicrotask accepts function argument',
    },
  ],
}
