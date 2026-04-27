import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new MouseEvent('click'),
      expect: is.object,
      info: 'MouseEvent is callable with new',
    },
    {
      fn: () => {
        const e = new MouseEvent('click')
        return e.type
      },
      expect: 'click',
      info: 'MouseEvent has correct type',
    },
    {
      fn: () => {
        const e = new MouseEvent('click')
        return e.clientX
      },
      expect: 0,
      info: 'MouseEvent clientX is 0 by default',
    },
    {
      fn: () => {
        const e = new MouseEvent('click', { clientX: 100, clientY: 200 })
        return e.clientX
      },
      expect: 100,
      info: 'MouseEvent clientX can be set',
    },
    {
      fn: () => {
        const e = new MouseEvent('click')
        return e.button
      },
      expect: 0,
      info: 'MouseEvent button is 0 by default (left click)',
    },
  ],
}
