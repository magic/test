import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new FormData(),
      expect: is.object,
      info: 'FormData is callable with new',
    },
    {
      fn: () => {
        const fd = new FormData()
        return fd.append
      },
      expect: is.fn,
      info: 'FormData has append method',
    },
    {
      fn: () => {
        const fd = new FormData()
        fd.append('key', 'value')
        return fd.get('key')
      },
      expect: 'value',
      info: 'FormData.append adds entry and get retrieves it',
    },
    {
      fn: () => {
        const fd = new FormData()
        fd.append('key', 'value1')
        fd.append('key', 'value2')
        return fd.getAll('key')
      },
      expect: ['value1', 'value2'],
      info: 'FormData.getAll returns all values for key',
    },
    {
      fn: () => {
        const fd = new FormData()
        fd.append('key', 'value')
        return fd.has('key')
      },
      expect: true,
      info: 'FormData.has returns true for existing key',
    },
  ],
}
