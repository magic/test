import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new CustomEvent('test'),
      expect: is.object,
      info: 'CustomEvent is callable with new',
    },
    {
      fn: () => {
        const e = new CustomEvent('custom')
        return e.type
      },
      expect: 'custom',
      info: 'CustomEvent has correct type',
    },
    {
      fn: () => {
        const e = new CustomEvent('test', { detail: { foo: 'bar' } })
        return e.detail
      },
      expect: { foo: 'bar' },
      info: 'CustomEvent can carry detail data',
    },
    {
      fn: () => {
        const e = new CustomEvent('test')
        return e.bubbles
      },
      expect: false,
      info: 'CustomEvent bubbles is false by default',
    },
    {
      fn: () => {
        const e = new CustomEvent('test', { detail: 42 })
        return e.detail
      },
      expect: 42,
      info: 'CustomEvent detail can be any value',
    },
  ],
}
