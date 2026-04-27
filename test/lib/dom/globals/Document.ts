import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

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
      fn: () => globalThis.document.body,
      expect: is.object,
      info: 'document has body property',
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
  ],
}
