import is from '@magic/types'
import type { Test } from '#src/types.js'

import { View } from '#docsrc/pages/error-codes.js'

export default [
  {
    name: 'View is function',
    fn: () => View,
    expect: is.function,
  },
  {
    name: 'View returns array',
    fn: () => {
      const result = View()
      return is.arr(result) && result.length > 0
    },
    expect: true,
  },
  {
    name: 'View returns array',
    fn: View,
    expect: is.arr,
  },
  {
    name: 'View returns non-empty array',
    fn: View,
    expect: is.not.empty,
  },
] satisfies Test[]
