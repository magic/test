import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'
import type { TestObject } from '../../../../src/types.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const doc = globalThis.document.implementation.createDocument('', '', null)
        return doc.nodeType
      },
      expect: 9,
      info: 'Document has correct nodeType',
    },
    {
      fn: () => globalThis.document,
      expect: is.object,
      info: 'document is an object',
    },
    {
      fn: () => globalThis.document.createElement('div'),
      expect: is.object,
      info: 'document.createElement returns element',
    },
    {
      fn: () => globalThis.document.createTextNode('text'),
      expect: is.object,
      info: 'document.createTextNode returns text node',
    },
    {
      fn: () => globalThis.document.body,
      expect: (t: unknown) => is.instance(t, HTMLBodyElement),
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
} satisfies TestObject
