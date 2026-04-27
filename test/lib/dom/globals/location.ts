import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.location,
      expect: is.object,
      info: 'location is an object',
    },
    {
      fn: () => globalThis.location.href,
      expect: is.str,
      info: 'location.href is a string',
    },
    {
      fn: () => globalThis.location.protocol,
      expect: 'http:',
      info: 'location.protocol is http:',
    },
    {
      fn: () => globalThis.location.host,
      expect: is.str,
      info: 'location.host is a string',
    },
    {
      fn: () => globalThis.location.pathname,
      expect: '/',
      info: 'location.pathname is /',
    },
  ],
}
