import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new PointerEvent('pointerdown'),
      expect: is.object,
      info: 'PointerEvent is callable with new',
    },
    {
      fn: () => {
        const e = new PointerEvent('pointerdown')
        return e.type
      },
      expect: 'pointerdown',
      info: 'PointerEvent has correct type',
    },
    {
      fn: () => {
        const e = new PointerEvent('pointerdown')
        return e.pointerId
      },
      expect: 0,
      info: 'PointerEvent pointerId is 0 by default',
    },
    {
      fn: () => {
        const e = new PointerEvent('pointerdown', { pointerId: 1 })
        return e.pointerId
      },
      expect: 1,
      info: 'PointerEvent pointerId can be set',
    },
    {
      fn: () => {
        const e = new PointerEvent('pointerdown')
        return e.pointerType
      },
      expect: '',
      info: 'PointerEvent pointerType is empty string by default',
    },
  ],
}
