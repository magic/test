import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const t = globalThis.document.createTextNode('hello')
        return is.object(t)
      },
      expect: true,
      info: 'Text is created via document.createTextNode',
    },
    {
      fn: () => {
        const t = globalThis.document.createTextNode('hello world')
        return t.textContent
      },
      expect: 'hello world',
      info: 'Text has correct textContent',
    },
    {
      fn: () => {
        const t = globalThis.document.createTextNode('hello')
        return t.nodeType
      },
      expect: 3,
      info: 'Text has correct nodeType',
    },
    {
      fn: () => {
        const t = globalThis.document.createTextNode('hello')
        return t.wholeText
      },
      expect: 'hello',
      info: 'Text has wholeText property',
    },
    {
      fn: () => {
        const t = globalThis.document.createTextNode('hello')
        return t.splitText(3)
      },
      expect: is.object,
      info: 'Text.splitText returns Text node',
    },
  ],
}
