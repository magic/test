import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new TouchEvent('touchstart'),
      expect: is.object,
      info: 'TouchEvent is callable with new',
    },
    {
      fn: () => {
        const e = new TouchEvent('touchstart')
        return e.type
      },
      expect: 'touchstart',
      info: 'TouchEvent has correct type',
    },
    {
      fn: () => {
        const e = new TouchEvent('touchstart')
        return e.touches
      },
      expect: is.object,
      info: 'TouchEvent has touches property',
    },
    {
      fn: () => {
        const e = new TouchEvent('touchstart')
        return e.targetTouches
      },
      expect: is.object,
      info: 'TouchEvent has targetTouches property',
    },
    {
      fn: () => {
        const e = new TouchEvent('touchstart')
        return e.changedTouches
      },
      expect: is.object,
      info: 'TouchEvent has changedTouches property',
    },
  ],
}
