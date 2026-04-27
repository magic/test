import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Headers(),
      expect: is.object,
      info: 'Headers is callable with new',
    },
    {
      fn: () => {
        const h = new Headers()
        return h.append
      },
      expect: is.fn,
      info: 'Headers has append method',
    },
    {
      fn: () => {
        const h = new Headers()
        h.append('Content-Type', 'application/json')
        return h.get('Content-Type')
      },
      expect: 'application/json',
      info: 'Headers.append and get work',
    },
    {
      fn: () => {
        const h = new Headers({ 'X-Custom': 'value' })
        return h.get('X-Custom')
      },
      expect: 'value',
      info: 'Headers can be initialized with object',
    },
    {
      fn: () => {
        const h = new Headers()
        h.append('key', 'value1')
        h.append('key', 'value2')
        const combined = h.get('key') || ''
        return combined.includes('value1') && combined.includes('value2')
      },
      expect: true,
      info: 'Headers.get returns combined values',
    },
  ],
}
