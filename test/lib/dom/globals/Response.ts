import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Response(),
      expect: is.object,
      info: 'Response is callable with new',
    },
    {
      fn: () => {
        const res = new Response('hello')
        return res.ok
      },
      expect: true,
      info: 'Response.ok is true for 200',
    },
    {
      fn: () => {
        const res = new Response('test', { status: 404 })
        return res.status
      },
      expect: 404,
      info: 'Response status can be set',
    },
    {
      fn: () => {
        const res = new Response('test', { status: 404 })
        return res.ok
      },
      expect: false,
      info: 'Response.ok is false for non-200',
    },
    {
      fn: () => {
        const res = new Response('hello')
        return res.headers
      },
      expect: is.object,
      info: 'Response has headers property',
    },
  ],
}
