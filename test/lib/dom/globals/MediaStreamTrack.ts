import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => globalThis.MediaStreamTrack,
      expect: is.fn,
      info: 'MediaStreamTrack is a constructor',
    },
    {
      fn: () => {
        return globalThis.MediaStreamTrack.prototype.stop
      },
      expect: is.fn,
      info: 'MediaStreamTrack.prototype.stop is a function',
    },
    {
      fn: () => {
        return globalThis.MediaStreamTrack.prototype.clone
      },
      expect: is.fn,
      info: 'MediaStreamTrack.prototype.clone is a function',
    },
    {
      fn: () => {
        return globalThis.MediaStreamTrack.prototype.addEventListener
      },
      expect: is.fn,
      info: 'MediaStreamTrack has addEventListener',
    },
    {
      fn: () => {
        return globalThis.MediaStreamTrack.prototype.removeEventListener
      },
      expect: is.fn,
      info: 'MediaStreamTrack has removeEventListener',
    },
  ],
}
