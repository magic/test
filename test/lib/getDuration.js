import is from '@magic/types'

import { getDuration } from '../../src/lib/getDuration.js'
import { store } from '../../src/lib/index.js'

const saveStore = () => {
  const state = store.get()
  return () => store.set(state)
}

export default [
  {
    fn: () => getDuration,
    expect: is.fn,
    info: 'getDuration is a function',
  },
  {
    fn: () => {
      const s = store.get()
      delete s.startTime
      return getDuration()
    },
    expect: '',
    info: 'returns empty string when startTime is deleted',
    before: saveStore,
  },
]
