import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => {
        const ac = new AbortController()
        return ac.signal
      },
      expect: is.object,
      info: 'AbortSignal is accessible via AbortController.signal',
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
    {
      fn: () => {
        const ac = new AbortController()
        return ac.signal.addEventListener
      },
      expect: is.fn,
      info: 'AbortSignal has addEventListener',
    },
    {
      fn: () => {
        const ac = new AbortController()
        ac.abort()
        return ac.signal.reason
      },
      expect: is.object,
      info: 'AbortSignal.reason is available after abort',
    },
  ],
}
