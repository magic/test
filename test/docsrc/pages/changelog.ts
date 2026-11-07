import is from '@magic/types'
import type { Test } from '#src/types.js'
import { View } from '#docsrc/pages/changelog.js'

export default [
  {
    name: 'docsrc/pages/changelog.js View is function',
    fn: () => {
      return View
    },
    expect: is.function,
  },
  {
    name: 'docsrc/pages/changelog.js View returns array of html strings',
    fn: () => {
      const result = View()
      return result.length > 0 && result.every(el => is.string(el))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.js View has h1 changelog heading',
    fn: () => {
      const result = View()
      return result.some(el => el.includes('<h1 id="changelog">'))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.js View has version headings',
    fn: () => {
      const result = View()
      const h2s = result.filter(el => el.includes('<h2>'))
      return h2s.length > 0 && h2s.every(el => el.includes('</h2>'))
    },
    expect: true,
  },
  {
    name: 'docsrc/pages/changelog.js View has list items',
    fn: () => {
      const result = View()
      const lists = result.filter(el => el.includes('<ul>') || el.includes('<li>'))
      return lists.length > 0 && lists.some(el => el.includes('</li>'))
    },
    expect: true,
  },
] satisfies Test[]
