import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.instance(el, Node)
      },
      expect: true,
      info: 'Element is instance of Node',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.num(el.nodeType)
      },
      expect: true,
      info: 'Node has nodeType property',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.str(el.nodeName)
      },
      expect: true,
      info: 'Node has nodeName property',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return el.parentNode === null || is.instance(el.parentNode, Node)
      },
      expect: true,
      info: 'Node has parentNode property',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.object(el.childNodes)
      },
      expect: true,
      info: 'Node has childNodes property',
    },
  ],
}
