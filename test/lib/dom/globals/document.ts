import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.document,
      expect: is.object,
      info: 'document is an object',
    },
    {
      fn: () => globalThis.document.body,
      expect: is.el,
      info: 'document.body is an element',
    },
    {
      fn: () => globalThis.document.createElement,
      expect: is.fn,
      info: 'document.createElement is a function',
    },
    {
      fn: () => globalThis.document.createTextNode,
      expect: is.fn,
      info: 'document.createTextNode is a function',
    },
    {
      fn: () => globalThis.document.querySelector,
      expect: is.fn,
      info: 'document.querySelector is a function',
    },
  ],
}
