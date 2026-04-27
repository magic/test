import is from '@magic/types'
import { initGlobals } from '../../../../src/lib/dom/globals.js'

export default {
  beforeAll: initGlobals,
  tests: [
    {
      fn: () => new PerformanceObserver(() => {}),
      expect: is.object,
      info: 'PerformanceObserver is callable with new',
    },
    {
      fn: () => {
        const obs = new PerformanceObserver(() => {})
        return obs.observe
      },
      expect: is.fn,
      info: 'PerformanceObserver has observe method',
    },
    {
      fn: () => {
        const obs = new PerformanceObserver(() => {})
        return obs.disconnect
      },
      expect: is.fn,
      info: 'PerformanceObserver has disconnect method',
    },
    {
      fn: () => {
        const obs = new PerformanceObserver(() => {})
        return obs.takeRecords
      },
      expect: is.fn,
      info: 'PerformanceObserver has takeRecords method',
    },
    {
      fn: () => {
        const obs = new PerformanceObserver(() => {})
        obs.observe({ entryTypes: ['measure'] })
        return true
      },
      expect: true,
      info: 'PerformanceObserver.observe works',
    },
  ],
}
