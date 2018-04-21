const is = require('@magic/types')

const store = require('../src/storage')

const before = () => () => store.set('key', undefined)

module.exports = [
  { fn: () => store === store.store, expect: true },
  { fn: () => store.set, expect: is.fn },
  { fn: () => store.get, expect: is.fn },
  { fn: () => store.suites, expect: is.obj },
  { fn: () => store.module, expect: '@magic/test' },
  { fn: () => store.stats, expect: is.obj },
  { fn: () => store.stats.all, expect: is.num },
  { fn: () => store.stats.pass, expect: is.num },
  { fn: () => store.stats.fail, expect: is.num },
  {
    fn: () => store.set('key', 'value'),
    expect: () => store.get('key') === 'value',
    before,
  },
  {
    fn: () => store.get('key'),
    expect: undefined,
  },
]
