import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new ResizeObserver(() => {}),
      expect: is.object,
      info: 'ResizeObserver is callable with new',
    },
    {
      fn: () => {
        const obs = new ResizeObserver(() => {})
        return obs.observe
      },
      expect: is.fn,
      info: 'ResizeObserver has observe method',
    },
    {
      fn: () => {
        const obs = new ResizeObserver(() => {})
        return obs.disconnect
      },
      expect: is.fn,
      info: 'ResizeObserver has disconnect method',
    },
    {
      fn: () => {
        const obs = new ResizeObserver(() => {})
        return obs.unobserve
      },
      expect: is.fn,
      info: 'ResizeObserver has unobserve method',
    },
    {
      fn: () => {
        const obs = new ResizeObserver(() => {})
        const el = globalThis.document.createElement('div')
        obs.observe(el)
        return true
      },
      expect: true,
      info: 'ResizeObserver.observe works',
    },
  ],
}
