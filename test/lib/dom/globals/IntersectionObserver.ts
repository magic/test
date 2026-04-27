import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new IntersectionObserver(() => {}),
      expect: is.object,
      info: 'IntersectionObserver is callable with new',
    },
    {
      fn: () => {
        const obs = new IntersectionObserver(() => {})
        return obs.observe
      },
      expect: is.fn,
      info: 'IntersectionObserver has observe method',
    },
    {
      fn: () => {
        const obs = new IntersectionObserver(() => {})
        return obs.disconnect
      },
      expect: is.fn,
      info: 'IntersectionObserver has disconnect method',
    },
    {
      fn: () => {
        const obs = new IntersectionObserver(() => {})
        return obs.unobserve
      },
      expect: is.fn,
      info: 'IntersectionObserver has unobserve method',
    },
    {
      fn: () => {
        const obs = new IntersectionObserver(() => {})
        const el = globalThis.document.createElement('div')
        obs.observe(el)
        return true
      },
      expect: true,
      info: 'IntersectionObserver.observe works',
    },
  ],
}
