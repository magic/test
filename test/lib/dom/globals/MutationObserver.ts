import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new MutationObserver(() => {}),
      expect: is.object,
      info: 'MutationObserver is callable with new',
    },
    {
      fn: () => {
        const obs = new MutationObserver(() => {})
        return obs.observe
      },
      expect: is.fn,
      info: 'MutationObserver has observe method',
    },
    {
      fn: () => {
        const obs = new MutationObserver(() => {})
        return obs.disconnect
      },
      expect: is.fn,
      info: 'MutationObserver has disconnect method',
    },
    {
      fn: () => {
        const obs = new MutationObserver(() => {})
        return obs.takeRecords
      },
      expect: is.fn,
      info: 'MutationObserver has takeRecords method',
    },
    {
      fn: () => {
        const obs = new MutationObserver(() => {})
        const el = globalThis.document.createElement('div')
        obs.observe(el, { attributes: true })
        return true
      },
      expect: true,
      info: 'MutationObserver.observe works with element',
    },
  ],
}
