const is = require('@magic/types')

const store = require('../../src/lib/store')

const before = () => () => store.set({ key: undefined })

module.exports = [
  { fn: () => store.set, expect: is.fn, info: 'store.set is a function' },
  { fn: () => store.get, expect: is.fn, info: 'store.get is a function' },
  { fn: () => store.state, expect: is.obj, info: 'store.state is an objectn' },
  { fn: () => store.get('suites'), expect: is.obj, info: 'suites are collected in an object' },
  { fn: () => store.get('module'), expect: '@magic/test', info: 'module @magic/test exists' },
  { fn: () => store.get('stats'), expect: is.obj, info: 'stats are collected in an object' },
  {
    fn: () => store.set({ key: 'value' }),
    expect: () => store.get('key') === 'value',
    before,
  },
  { fn: () => store.get('key2'), expect: is.undefined, before, info: 'store.get(key) returns undefined' },
  { fn: () => store.get(), expect: is.object, info: 'store.get() returns object' },
]