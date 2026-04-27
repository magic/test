import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        if (!globalThis.customElements) {
          return true
        }
        return is.object(globalThis.customElements)
      },
      expect: true,
      info: 'CustomElementRegistry exists or is undefined in happy-dom',
    },
    {
      fn: () => {
        if (!globalThis.customElements) {
          return true
        }
        return is.fn(globalThis.customElements.define)
      },
      expect: true,
      info: 'CustomElementRegistry has define method',
    },
    {
      fn: () => {
        if (!globalThis.customElements) {
          return true
        }
        return is.fn(globalThis.customElements.get)
      },
      expect: true,
      info: 'CustomElementRegistry has get method',
    },
    {
      fn: () => {
        if (!globalThis.customElements) {
          return true
        }
        return is.fn(globalThis.customElements.whenDefined)
      },
      expect: true,
      info: 'CustomElementRegistry has whenDefined method',
    },
    {
      fn: () => {
        if (!globalThis.customElements) {
          return true
        }
        return is.fn(globalThis.customElements.upgrade)
      },
      expect: true,
      info: 'CustomElementRegistry has upgrade method',
    },
  ],
}
