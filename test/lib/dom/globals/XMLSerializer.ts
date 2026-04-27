import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new XMLSerializer(),
      expect: is.object,
      info: 'XMLSerializer is callable with new',
    },
    {
      fn: () => {
        const xs = new XMLSerializer()
        return xs.serializeToString
      },
      expect: is.fn,
      info: 'XMLSerializer has serializeToString method',
    },
    {
      fn: () => {
        const xs = new XMLSerializer()
        const doc = globalThis.document
        return xs.serializeToString(doc)
      },
      expect: is.str,
      info: 'XMLSerializer.serializeToString returns string',
    },
    {
      fn: () => {
        const xs = new XMLSerializer()
        const el = globalThis.document.createElement('div')
        el.textContent = 'test'
        const result = xs.serializeToString(el)
        return result.includes('test')
      },
      expect: true,
      info: 'XMLSerializer.serializeToString includes text content',
    },
    {
      fn: () => {
        const xs = new XMLSerializer()
        const frag = globalThis.document.createDocumentFragment()
        return xs.serializeToString(frag)
      },
      expect: '',
      info: 'XMLSerializer.serializeToString handles empty fragment',
    },
  ],
}
