import is from '@magic/types'
import type { Test } from '#src/types.js'
import { View } from '#docsrc/pages/cli.mjs'

export default [
  {
    name: 'View is function',
    fn: async () => {
      const { View } = await import('../../../docsrc/pages/cli.mjs')
      return is.function(View)
    },
    expect: true,
  },
  {
    name: 'View returns array',
    fn: async () => {
      const result = View({})
      return is.arr(result) && result.length > 0
    },
    expect: true,
  },
] satisfies Test[]
