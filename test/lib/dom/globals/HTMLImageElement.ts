import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.HTMLImageElement,
      expect: is.fn,
      info: 'HTMLImageElement is a constructor',
    },
    {
      fn: () => {
        const img = globalThis.document.createElement('img')
        return img.tagName
      },
      expect: 'IMG',
      info: 'IMG element has correct tagName',
    },
    {
      fn: () => {
        const img = globalThis.document.createElement('img')
        return img.src
      },
      expect: '',
      info: 'HTMLImageElement.src is empty by default',
    },
    {
      fn: () => {
        const img = globalThis.document.createElement('img')
        return img.alt
      },
      expect: '',
      info: 'HTMLImageElement.alt is empty by default',
    },
    {
      fn: () => {
        const img = globalThis.document.createElement('img')
        return img.complete
      },
      expect: true,
      info: 'HTMLImageElement.complete is true',
    },
  ],
}
