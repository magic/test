import is from '@magic/types'

import { createStore } from '../../src/lib/store.js'

const store = createStore()

export default [
  { fn: () => store.set, expect: is.fn, info: 'store.set is a function' },
  { fn: () => store.get, expect: is.fn, info: 'store.get is a function' },
  { fn: () => store.state, expect: is.obj, info: 'store.state is an objectn' },
  {
    fn: () => store.get('suites'),
    expect: is.obj,
    info: 'suites are collected in an object',
  },
  {
    fn: () => store.get('stats'),
    expect: is.obj,
    info: 'stats are collected in an object',
  },
  {
    fn: () => {
      store.set({ testKey: 'testValue' })
      return store.get('testKey') === 'testValue'
    },
    expect: true,
    info: 'store.set and store.get work together',
  },
  {
    fn: () => {
      store.set({ anotherKey: 'anotherValue' })
      return store.get('anotherKey')
    },
    expect: 'anotherValue',
    info: 'store.set stores value that can be retrieved',
  },
  {
    fn: () => store.get(),
    expect: is.object,
    info: 'store.get() returns object',
  },
  {
    fn: () => {
      store.set({ testKey: 'value' })
      store.reset()
      return store.get('testKey') === undefined
    },
    expect: true,
    info: 'store.reset clears all state',
  },
]
