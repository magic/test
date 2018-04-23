const is = require('@magic/types')

const store = require('../src/store')

const before = () => () => store.set({ key: undefined })

module.exports = [
  { fn: () => store.set, expect: is.fn },
  { fn: () => store.get, expect: is.fn },
  { fn: () => store.get('suites'), expect: is.obj },
  { fn: () => store.get('module'), expect: '@magic/test' },
  { fn: () => store.get('stats'), expect: is.obj },
  {
    fn: () => store.set({ key: 'value' }),
    expect: () => store.get('key') === 'value',
    before,
  },
  {
    fn: () => store.get('key'),
    expect: undefined,
  },
]
