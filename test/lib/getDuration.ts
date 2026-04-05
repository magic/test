import { is } from '@magic/types'
import { getDuration } from '../../src/lib/getDuration.js'
import { Store } from '../../src/lib/store.js'

const beforeAll = () => {
  ;(globalThis as any).store = new Store()

  return () => {
    ;(globalThis as any).store = undefined
  }
}

export default {
  beforeAll,
  tests: [
    {
      fn: () => {
        const store = (globalThis as any).store as Store
        store.state.startTime = undefined
        return getDuration(store)
      },
      expect: '',
      info: 'returns empty string when startTime is undefined',
    },
    {
      fn: () => {
        const store = (globalThis as any).store as Store
        ;(store.state as any).startTime = null
        return getDuration(store)
      },
      expect: '',
      info: 'returns empty string when startTime is null',
    },
    {
      fn: () => {
        const store = (globalThis as any).store as Store
        store.state.startTime = [0, 0]
        const result = getDuration(store)
        return result
      },
      expect: is.string,
      info: 'returns string when startTime exists',
    },
  ],
}
