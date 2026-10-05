import is from '@magic/types'
import type { Test } from '#src/types.js'

import { state } from '#docsrc/app.mjs'

export default [
  {
    name: 'docsrc/app.mjs exports state',
    fn: async () => {
      return is.object(state) && is.ownProp(state, 'title') && is.ownProp(state, 'description')
    },
    expect: true,
  },
  {
    name: 'docsrc/app.mjs has title',
    fn: async () => {
      return state.title === '@magic/test'
    },
    expect: true,
  },
  {
    name: 'docsrc/app.mjs has menu',
    fn: async () => {
      return is.arr(state.menu) && state.menu.length > 0
    },
    expect: true,
  },
] satisfies Test[]
