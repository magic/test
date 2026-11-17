import type { Test } from '#src/types.js'

import is from '@magic/types'

import { View } from '#docsrc/pages/cli.js'

export default [
  {
    name: 'View is function',
    fn: () => View,
    expect: is.function,
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
