import { Store } from '../../../src/lib/store.js'
import { reset } from '../../../src/lib/stats/reset.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Basic reset
  {
    fn: () => {
      const store = new Store()
      store.set({ pkg: '@magic/test' })
      reset(store)
      return store.state.pkg
    },
    expect: '',
    info: 'reset clears pkg to empty string',
  },
  // reset clears suites
  {
    fn: () => {
      const store = new Store()
      store.set({ suites: { test: {} } })
      reset(store)
      return Object.keys(store.state.suites).length
    },
    expect: 0,
    info: 'reset clears suites',
  },
  // reset restores default stats
  {
    fn: () => {
      const store = new Store()
      store.set({ stats: { all: 100, pass: 50, fail: 50 } })
      reset(store)
      return store.state.stats
    },
    expect: { all: 0, pass: 0, fail: 0 },
    info: 'reset restores default stats',
  },
  // reset works on fresh store
  {
    fn: () => {
      const store = new Store()
      reset(store)
      return store.state.pkg === '' && Object.keys(store.state.suites).length === 0
    },
    expect: true,
    info: 'reset works on fresh store',
  },
  // Multiple resets
  {
    fn: () => {
      const store = new Store()
      store.set({ pkg: 'first' })
      reset(store)
      store.set({ pkg: 'second' })
      reset(store)
      return store.state.pkg
    },
    expect: '',
    info: 'multiple resets work correctly',
  },
] satisfies TestCase[]
