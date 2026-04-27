import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new XMLHttpRequest(),
      expect: is.object,
      info: 'XMLHttpRequest is callable with new',
    },
    {
      fn: () => {
        const xhr = new XMLHttpRequest()
        return xhr.open
      },
      expect: is.fn,
      info: 'XMLHttpRequest has open method',
    },
    {
      fn: () => {
        const xhr = new XMLHttpRequest()
        return xhr.send
      },
      expect: is.fn,
      info: 'XMLHttpRequest has send method',
    },
    {
      fn: () => {
        const xhr = new XMLHttpRequest()
        return xhr.setRequestHeader
      },
      expect: is.fn,
      info: 'XMLHttpRequest has setRequestHeader method',
    },
    {
      fn: () => {
        const xhr = new XMLHttpRequest()
        return xhr.readyState
      },
      expect: 0,
      info: 'XMLHttpRequest.readyState is 0 (UNSENT) by default',
    },
  ],
}
