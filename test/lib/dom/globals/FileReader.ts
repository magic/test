import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new FileReader(),
      expect: is.object,
      info: 'FileReader is callable with new',
    },
    {
      fn: () => {
        const fr = new FileReader()
        return fr.readAsText
      },
      expect: is.fn,
      info: 'FileReader has readAsText method',
    },
    {
      fn: () => {
        const fr = new FileReader()
        return fr.readAsArrayBuffer
      },
      expect: is.fn,
      info: 'FileReader has readAsArrayBuffer method',
    },
    {
      fn: () => {
        const fr = new FileReader()
        return fr.result
      },
      expect: null,
      info: 'FileReader.result is null before reading',
    },
    {
      fn: () => {
        const fr = new FileReader()
        return fr.readyState
      },
      expect: 0,
      info: 'FileReader.readyState is 0 (EMPTY) by default',
    },
  ],
}
