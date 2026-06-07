import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.fetch,
      expect: is.fn,
      info: 'fetch is a function',
    },
    {
      fn: () => {
        const result = globalThis.fetch('data:text/html,hello')
        return result.then
      },
      expect: is.fn,
      info: 'fetch returns a Promise',
    },
    {
      fn: () => {
        const result = globalThis.fetch('data:text/html,hello')
        return result.then
      },
      expect: is.fn,
      info: 'fetch accepts data URL',
    },
    {
      fn: () => {
        const result = globalThis.fetch('data:text/html,hello', { method: 'POST' })
        return result.then
      },
      expect: is.fn,
      info: 'fetch accepts options object',
    },
    {
      fn: () => {
        const result = globalThis.fetch(new Request('data:text/html,hello'))
        return result.then
      },
      expect: is.fn,
      info: 'fetch accepts Request object',
    },
  ],
}
