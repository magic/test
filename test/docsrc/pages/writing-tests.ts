import is from '@magic/types'
import type { Test } from '#src/types.js'
import { View } from '#docsrc/pages/writing-tests.mjs'

export default [
  {
    name: 'View is function',
    fn: () => {
      return is.function(View)
    },
    expect: true,
  },
  {
    name: 'View returns array',
    fn: () => {
      const result = View()
      return is.arr(result) && result.length > 0
    },
    expect: true,
  },
] satisfies Test[]
