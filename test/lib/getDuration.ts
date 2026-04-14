import { is } from '@magic/types'
import { getDuration } from '../../src/lib/getDuration.js'
import { Store } from '../../src/lib/store.js'

interface TestGlobals {
  store?: Store
}

const beforeAll = () => {
  const g = globalThis as TestGlobals
  g.store = new Store()

  return () => {
    g.store = undefined
  }
}

export default {
  beforeAll,
  tests: [
    {
      fn: () => {
        const g = globalThis as TestGlobals
        const store = g.store as Store
        store.state.startTime = undefined
        return getDuration(store)
      },
      expect: '',
      info: 'returns empty string when startTime is undefined',
    },
    {
      fn: () => {
        const g = globalThis as TestGlobals
        delete g.store?.state.startTime
        return g.store && getDuration(g.store)
      },
      expect: '',
      info: 'returns empty string when startTime is null',
    },
    {
      fn: () => {
        const g = globalThis as TestGlobals
        const store = g.store as Store
        store.state.startTime = [0, 0]
        const result = getDuration(store)
        return result
      },
      expect: is.string,
      info: 'returns string when startTime exists',
    },
  ],
}
