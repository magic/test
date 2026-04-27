import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Request('http://localhost'),
      expect: is.object,
      info: 'Request is callable with new',
    },
    {
      fn: () => {
        const req = new Request('http://localhost')
        return req.url
      },
      expect: 'http://localhost/',
      info: 'Request has url property',
    },
    {
      fn: () => {
        const req = new Request('http://localhost', { method: 'POST' })
        return req.method
      },
      expect: 'POST',
      info: 'Request method can be set',
    },
    {
      fn: () => {
        const req = new Request('http://localhost')
        return req.headers
      },
      expect: is.object,
      info: 'Request has headers property',
    },
    {
      fn: () => {
        const req = new Request('http://localhost', { method: 'POST' })
        return req.method
      },
      expect: (t: string) => is.str(t) && t === 'POST',
      info: 'Request method defaults to GET',
    },
  ],
}
