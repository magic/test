import is from '@magic/types'

import store from '../src/store'

const before = () => () => store.set({ key: undefined })

export default [
  { fn: () => store.set, expect: is.fn },
  { fn: () => store.get, expect: is.fn },
  { fn: () => store.get('suites'), expect: is.obj },
  { fn: () => store.get('module'), expect: '@magic/test' },
  { fn: () => store.get('stats'), expect: is.obj },
  {
    fn: () => store.set({ key: 'value' }),
    expect: () => store.get('key') === 'value',
    before,
    info: 'keys can be set',
  },
  { fn: () => store.get('key'), expect: undefined, info: 'unset keys return undefined' },
]
