import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.document.createDocumentFragment(),
      expect: is.object,
      info: 'DocumentFragment is instance of DocumentFragment',
    },
    {
      fn: () => {
        const frag = globalThis.document.createDocumentFragment()
        return frag.childNodes
      },
      expect: is.object,
      info: 'DocumentFragment has childNodes',
    },
    {
      fn: () => {
        const frag = globalThis.document.createDocumentFragment()
        return frag.nodeType
      },
      expect: 11,
      info: 'DocumentFragment has correct nodeType',
    },
    {
      fn: () => {
        const frag = globalThis.document.createDocumentFragment()
        return frag.appendChild(globalThis.document.createElement('div'))
      },
      expect: is.object,
      info: 'DocumentFragment.appendChild returns element',
    },
    {
      fn: () => {
        const frag = globalThis.document.createDocumentFragment()
        return frag.firstChild
      },
      expect: null,
      info: 'DocumentFragment.firstChild is null when empty',
    },
  ],
}
