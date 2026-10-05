import { maybeInjectMagic } from '#src/bin/lib/maybeInjectMagic'
import is from '@magic/types'
import type { Test } from '#src/types.js'

export default [
  {
    name: 'docsrc/pages/changelog.mjs View is function',
    fn: async () => {
      const { View } = await import('../../docsrc/pages/changelog.mjs')
      return is.function(View)
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.mjs View returns array of html strings',
    fn: async () => {
      await maybeInjectMagic()
      const { View } = await import('../../docsrc/pages/changelog.mjs')
      const result = View({})
      return is.arr(result) && result.length > 0 && result.every(el => is.string(el))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.mjs View has h1 changelog heading',
    fn: async () => {
      await maybeInjectMagic()
      const { View } = await import('../../docsrc/pages/changelog.mjs')
      const result = View({})
      return is.arr(result) && result.some(el => el.includes('<h1 id="changelog">'))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.mjs View has version headings',
    fn: async () => {
      await maybeInjectMagic()
      const { View } = await import('../../docsrc/pages/changelog.mjs')
      const result = View({})
      const h2s = result.filter(el => el.includes('<h2>'))
      return is.arr(result) && h2s.length > 0 && h2s.every(el => el.includes('</h2>'))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.mjs View has list items',
    fn: async () => {
      await maybeInjectMagic()
      const { View } = await import('../../docsrc/pages/changelog.mjs')
      const result = View({})
      const lists = result.filter(el => el.includes('<ul>') || el.includes('<li>'))
      return is.arr(result) && lists.length > 0 && lists.some(el => el.includes('</li>'))
    },
    expect: true,
  },
] satisfies Test[]
