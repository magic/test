import { Store, createStore } from '../../src/lib/store.js'
import type { TestCase } from '../../src/types.js'

export default [
  // Initial state
  {
    fn: () => {
      const store = new Store()
      return typeof store.state === 'object' && store.state !== null
    },
    expect: true,
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
      const time = Date.now()
      store.set({ startTime: time })
      return typeof store.state.startTime === 'number'
    },
    expect: true,
    info: 'set updates startTime',
  },
  // set results
  {
    fn: () => {
      const store = new Store()
      store.set({ results: [{ name: 'test', pass: true }] })
      return Array.isArray(store.state.results) && store.state.results.length === 1
    },
    expect: true,
    info: 'set updates results',
  },
  // set arbitrary key (lines 22-29)
  {
    fn: () => {
      const store = new Store()
      // @ts-ignore - testing arbitrary key
      store.set({ customKey: 'customValue' })
      // @ts-ignore
      return store.state.customKey
    },
    expect: 'customValue',
    info: 'set allows arbitrary keys',
  },
  // get full state
  {
    fn: () => {
      const store = new Store()
      return typeof store.get()
    },
    expect: 'object',
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
      return typeof store.state === 'object'
    },
    expect: true,
    info: 'createStore creates new store instance',
  },
] satisfies TestCase[]
