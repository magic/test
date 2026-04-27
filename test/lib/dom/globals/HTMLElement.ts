import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.instance(el, globalThis.HTMLElement)
      },
      expect: true,
      info: 'HTMLElement is instance of HTMLElement',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.num(el.offsetHeight)
      },
      expect: true,
      info: 'HTMLElement has offsetHeight',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.num(el.offsetWidth)
      },
      expect: true,
      info: 'HTMLElement has offsetWidth',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        return is.str(el.className)
      },
      expect: true,
      info: 'HTMLElement has className',
    },
    {
      fn: () => {
        const el = globalThis.document.createElement('div')
        el.style.color = 'red'
        return is.str(el.style.color)
      },
      expect: true,
      info: 'HTMLElement has style property',
    },
  ],
}
