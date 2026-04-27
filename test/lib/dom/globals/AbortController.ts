import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new AbortController(),
      expect: is.object,
      info: 'AbortController is callable with new',
    },
    {
      fn: () => {
        const ac = new AbortController()
        return ac.signal
      },
      expect: is.object,
      info: 'AbortController has signal property',
    },
    {
      fn: () => {
        const ac = new AbortController()
        return ac.abort
      },
      expect: is.fn,
      info: 'AbortController has abort method',
    },
    {
      fn: () => {
        const ac = new AbortController()
        return ac.signal.aborted
      },
      expect: false,
      info: 'AbortSignal.aborted is false by default',
    },
    {
      fn: () => {
        const ac = new AbortController()
        ac.abort()
        return ac.signal.aborted
      },
      expect: true,
      info: 'AbortSignal.aborted is true after abort',
    },
  ],
}
