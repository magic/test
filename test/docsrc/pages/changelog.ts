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
      return result
    },
    expect: [is.arr, (v: unknown[]) => v.length > 0 && v.every(el => is.string(el))],
  },
  {
    name: 'docsrc/pages/changelog.js View has h1 changelog heading',
    fn: () => {
      const result = View()
      return result
    },
    expect: (v: string[]) => v.some(el => el.includes('<h1 id="changelog">')),
  },
  {
    name: 'docsrc/pages/changelog.js View has version headings',
    fn: () => {
      const result = View()
      const h2s = result.filter(el => el.includes('<h2>'))
      return h2s
    },
    expect: (v: string[]) => v.length > 0 && v.every(el => el.includes('</h2>')),
  },
  {
    name: 'docsrc/pages/changelog.js View has list items',
    fn: () => {
      const result = View()
      const lists = result.filter(el => el.includes('<ul>') || el.includes('<li>'))
      return lists
    },
    expect: (v: string[]) => v.length > 0 && v.some(el => el.includes('</li>')),
  },
] satisfies Test[]
