import is from '@magic/types'
import { Store, createStore } from '../../src/lib/store.js'
import type { TestCase } from '../../src/types.js'

const tests: TestCase[] = [
  // Initial state
  {
    fn: () => {
      const store = new Store()
      return store.state
    },
    expect: is.objectNative,
    info: 'store initializes with state object',
  },
  // set suites
  {
    fn: () => {
      const store = new Store()
      store.set({ suites: { test1: {} } })
      return 'test1' in store.state.suites
    },
    expect: true,
    info: 'set adds suites to state',
  },
  // set stats
  {
    fn: () => {
      const store = new Store()
      store.set({ stats: { all: 10, pass: 8, fail: 2 } })
      return store.state.stats.fail
    },
    expect: 2,
    info: 'set updates stats',
  },
  // set pkg
  {
    fn: () => {
      const store = new Store()
      store.set({ pkg: '@magic/test' })
      return store.state.pkg
    },
    expect: '@magic/test',
    info: 'set updates pkg',
  },
  // set startTime
  {
    fn: () => {
      const store = new Store()
      const time: [number, number] = [1234567890, 123]
      store.set({ startTime: time })
      return store.state.startTime !== null
    },
    expect: true,
    info: 'set updates startTime',
  },
  // set results
  {
    fn: () => {
      const store = new Store()
      store.set({ results: { test: { all: 1, pass: 1 } } })
      return store.state.results !== undefined ? 1 : 0
    },
    expect: 1,
    info: 'set updates results',
  },
  // set arbitrary key
  {
    fn: () => {
      const store = new Store()
      // @ts-expect-error - testing arbitrary keys on state
      store.set({ customKey: 'customValue' })
      // @ts-expect-error - accessing custom key on state
      return store.state.customKey
    },
    expect: 'customValue',
    info: 'set allows arbitrary keys',
  },
  // get full state
  {
    fn: () => {
      const store = new Store()
      return store.get()
    },
    expect: is.object,
    info: 'get() without key returns full state',
  },
  // get by key
  {
    fn: () => {
      const store = new Store()
      store.set({ pkg: '@magic/test' })
      return store.get<string>('pkg')
    },
    expect: '@magic/test',
    info: 'get retrieves value by key',
  },
  // get with default when key missing
  {
    fn: () => {
      const store = new Store()
      return store.get('missing', 'default')
    },
    expect: 'default',
    info: 'get returns default when key missing',
  },
  // get returns undefined when key missing with no default
  {
    fn: () => {
      const store = new Store()
      return store.get('missing')
    },
    expect: undefined,
    info: 'get returns undefined when key missing',
  },
  // reset
  {
    fn: () => {
      const store = new Store()
      store.set({ pkg: '@magic/test' })
      store.reset()
      return store.state.pkg
    },
    expect: '',
    info: 'reset restores default state',
  },
  // reset clears suites
  {
    fn: () => {
      const store = new Store()
      store.set({ suites: { test: {} } })
      store.reset()
      return Object.keys(store.state.suites).length
    },
    expect: 0,
    info: 'reset clears suites',
  },
  // createStore factory
  {
    fn: () => {
      const store = createStore()
      return store.state
    },
    expect: is.object,
    info: 'createStore creates new store instance',
  },
]

export default tests
