import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const el = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        return is.instance(el, globalThis.SVGElement)
      },
      expect: true,
      info: 'SVGElement is instance of SVGElement',
    },
    {
      fn: () => {
        const el = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        return el.tagName
      },
      expect: 'svg',
      info: 'SVGElement has tagName svg',
    },
    {
      fn: () => {
        const el = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        return el.style
      },
      expect: is.object,
      info: 'SVGElement has style property',
    },
    {
      fn: () => {
        const el = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        el.setAttribute('viewBox', '0 0 100 100')
        return el.getAttribute('viewBox')
      },
      expect: '0 0 100 100',
      info: 'SVGElement can set and get SVG-specific attributes',
    },
    {
      fn: () => {
        const el = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        return el.dataset
      },
      expect: is.object,
      info: 'SVGElement has dataset property',
    },
  ],
}
