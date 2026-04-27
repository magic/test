import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new URL('http://localhost'),
      expect: is.object,
      info: 'URL is callable with new',
    },
    {
      fn: () => new URL('http://localhost').href,
      expect: 'http://localhost/',
      info: 'URL has correct href',
    },
    {
      fn: () => new URL('http://localhost').protocol,
      expect: 'http:',
      info: 'URL has correct protocol',
    },
    {
      fn: () => new URL('http://localhost:8080').host,
      expect: 'localhost:8080',
      info: 'URL has correct host',
    },
    {
      fn: () => new URL('http://localhost/path?query=1').pathname,
      expect: '/path',
      info: 'URL has correct pathname',
    },
  ],
}
