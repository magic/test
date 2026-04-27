import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new InputEvent('input'),
      expect: is.object,
      info: 'InputEvent is callable with new',
    },
    {
      fn: () => {
        const e = new InputEvent('input')
        return e.type
      },
      expect: 'input',
      info: 'InputEvent has correct type',
    },
    {
      fn: () => {
        const e = new InputEvent('input')
        return e.bubbles
      },
      expect: false,
      info: 'InputEvent bubbles is false by default',
    },
    {
      fn: () => {
        const e = new InputEvent('input', { bubbles: true })
        return e.bubbles
      },
      expect: true,
      info: 'InputEvent bubbles can be set to true',
    },
    {
      fn: () => {
        const e = new InputEvent('input')
        return e.cancelable
      },
      expect: false,
      info: 'InputEvent cancelable is false by default',
    },
  ],
}
