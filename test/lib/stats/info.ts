import { info } from '#lib/stats/info.js'
import { createStore } from '#lib/store.js'
import type { Test, TestResults } from '#src/types.js'

export default [
  // info with no results should return true
  {
    fn: () => {
      const store = createStore()
      return info([], store) === true
    },
    expect: true,
    info: 'info with no results returns true',
  },
  // info with no suites should return true
  {
    fn: () => {
      const store = createStore()
      store.set({ results: {} })
      return info([], store) === true
    },
    expect: true,
    info: 'info with empty suites array returns true',
  },
  // info with empty test results should not crash
  {
    fn: () => {
      const store = createStore()
      store.set({ results: { test1: { all: 1, pass: 1 } } })
      return info(['test1'], store) === true
    },
    expect: true,
    info: 'info with test results returns true',
  },
  // info sets default values when results missing
  {
    fn: () => {
      const store = createStore()
      store.set({ results: { test1: { all: 10, pass: 8 } } })
      info(['test1'], store)
      const results = store.get<TestResults>('results')
      return results?.test1?.all === 10 && results?.test1?.pass === 8
    },
    expect: true,
    info: 'info can read results from store',
  },
] satisfies Test[]
