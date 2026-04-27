import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.navigator,
      expect: is.object,
      info: 'navigator is an object',
    },
    {
      fn: () => globalThis.navigator.userAgent,
      expect: is.str,
      info: 'navigator.userAgent is a string',
    },
    {
      fn: () => globalThis.navigator.language,
      expect: is.str,
      info: 'navigator.language is a string',
    },
    {
      fn: () => globalThis.navigator.languages,
      expect: is.array,
      info: 'navigator.languages is an array',
    },
    {
      fn: () => globalThis.navigator.onLine,
      expect: true,
      info: 'navigator.onLine is true',
    },
  ],
}
