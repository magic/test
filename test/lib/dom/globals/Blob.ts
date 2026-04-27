import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new Blob(),
      expect: is.object,
      info: 'Blob is callable with new',
    },
    {
      fn: () => new Blob().size,
      expect: 0,
      info: 'Empty Blob has size 0',
    },
    {
      fn: () => new Blob().type,
      expect: '',
      info: 'Blob type is empty string by default',
    },
    {
      fn: () => new Blob(['hello']).size,
      expect: 5,
      info: 'Blob size reflects content',
    },
    {
      fn: () => new Blob(['hello'], { type: 'text/plain' }).type,
      expect: 'text/plain',
      info: 'Blob type can be set via options',
    },
  ],
}
