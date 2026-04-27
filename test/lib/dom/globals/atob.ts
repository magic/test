import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.atob,
      expect: is.fn,
      info: 'atob is a function',
    },
    {
      fn: () => globalThis.atob('aGVsbG8='),
      expect: 'hello',
      info: 'atob decodes base64',
    },
    {
      fn: () => globalThis.atob('d29ybGQ='),
      expect: 'world',
      info: 'atob decodes another base64 string',
    },
    {
      fn: () => {
        try {
          globalThis.atob('not-valid-base64!')
          return false
        } catch {
          return true
        }
      },
      expect: true,
      info: 'atob throws on invalid input',
    },
    {
      fn: () => globalThis.atob(''),
      expect: '',
      info: 'atob handles empty string',
    },
  ],
}
