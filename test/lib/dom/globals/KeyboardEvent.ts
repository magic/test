import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new KeyboardEvent('keydown'),
      expect: is.object,
      info: 'KeyboardEvent is callable with new',
    },
    {
      fn: () => {
        const e = new KeyboardEvent('keydown')
        return e.type
      },
      expect: 'keydown',
      info: 'KeyboardEvent has correct type',
    },
    {
      fn: () => {
        const e = new KeyboardEvent('keydown')
        return e.key
      },
      expect: '',
      info: 'KeyboardEvent key is empty string by default',
    },
    {
      fn: () => {
        const e = new KeyboardEvent('keydown', { key: 'Enter' })
        return e.key
      },
      expect: 'Enter',
      info: 'KeyboardEvent key can be set',
    },
    {
      fn: () => {
        const e = new KeyboardEvent('keydown')
        return e.code
      },
      expect: '',
      info: 'KeyboardEvent code is empty string by default',
    },
  ],
}
