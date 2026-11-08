import is from '@magic/types'
import type { Test } from '#src/types.js'
import { View } from '#docsrc/pages/index.js'

export default [
  {
    name: 'View is function',
    fn: () => {
      return is.function(View)
    },
    expect: true,
  },
  {
    name: 'View returns array of html strings',
    fn: () => {
      const result = View()
      return result.length > 0 && result.every(el => is.string(el))
    },
    expect: true,
  },
  {
    name: 'View has magictest h1 heading',
    fn: () => {
      const result = View()
      return result
    },
    expect: [is.arr, (v: string[]) => v.some(el => el.includes('<h1 id="magictest">'))],
  },
  {
    name: 'View has getting-started section',
    fn: () => {
      const result = View()
      return result
    },
    expect: (v: string[]) => v.some(el => el.includes('id="getting-started"')),
  },
  {
    name: 'View has code blocks',
    fn: () => {
      const result = View()
      const pres = result.filter(el => el.includes('<pre') || el.includes('Pre'))
      return pres.length > 0
    },
    expect: true,
  },
] satisfies Test[]
