import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.instance(el, globalThis.Element)
      },
      expect: true,
      info: 'Element is instance of Element',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return el.tagName
      },
      expect: 'DIV',
      info: 'Element has tagName property',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return el.classList
      },
      expect: is.object,
      info: 'Element has classList',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        el.setAttribute('id', 'test')
        return el.getAttribute('id')
      },
      expect: 'test',
      info: 'Element can set and get attributes',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return el.children
      },
      expect: is.object,
      info: 'Element has children property',
    },
  ],
}
