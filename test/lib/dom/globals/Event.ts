import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Event('test'),
      expect: is.object,
      info: 'Event is callable with new',
    },
    {
      fn: () => {
        const e = new Event('click')
        return e.type
      },
      expect: 'click',
      info: 'Event has correct type',
    },
    {
      fn: () => {
        const e = new Event('test')
        return e.bubbles
      },
      expect: false,
      info: 'Event bubbles is false by default',
    },
    {
      fn: () => {
        const e = new Event('test', { bubbles: true })
        return e.bubbles
      },
      expect: true,
      info: 'Event bubbles can be set to true',
    },
    {
      fn: () => {
        const e = new Event('test')
        return e.cancelable
      },
      expect: false,
      info: 'Event cancelable is false by default',
    },
  ],
}
