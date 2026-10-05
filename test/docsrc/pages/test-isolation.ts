import is from '@magic/types'
import type { Test } from '#src/types.js'
import { maybeInjectMagic } from '#src/bin/lib/maybeInjectMagic.js'

export default [
  {
    name: 'View is function',
    fn: async () => {
      const { View } = await import('../../../docsrc/pages/test-isolation.mjs')
      return is.function(View)
    },
    expect: true,
  },
  {
    name: 'View returns array',
    fn: async () => {
      await maybeInjectMagic()
      const { View } = await import('../../../docsrc/pages/test-isolation.mjs')
      const result = View({})
      return is.arr(result) && result.length > 0
    },
    expect: true,
  },
] satisfies Test[]
