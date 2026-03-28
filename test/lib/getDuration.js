import { is } from '@magic/types'

import { getDuration } from '../../src/lib/getDuration.js'
import { Store } from '../../src/lib/store.js'

const beforeAll = () => {
  globalThis.store = new Store()

  return () => {
    globalThis.store = undefined
  }
}

export default {
  beforeAll,
  tests: [
    {
      fn: () => {
        store.state.startTime = undefined
        return getDuration(globalThis.store)
      },
      expect: '',
      info: 'returns empty string when startTime is undefined',
    },
    {
      fn: () => {
        globalThis.store.state.startTime = null
        return getDuration(globalThis.store)
      },
      expect: '',
      info: 'returns empty string when startTime is null',
    },
    {
      fn: () => {
        globalThis.store.state.startTime = [0, 0]
        const result = getDuration(globalThis.store)
        return result
      },
      expect: is.string,
      info: 'returns string when startTime exists',
    },
  ],
}
