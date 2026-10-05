import is from '@magic/types'
import type { Test } from '#src/types.js'
import { View } from '#docsrc/pages/index.mjs'

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
      const result = View({})
      return is.arr(result) && result.length > 0 && result.every(el => is.string(el))
    },
    expect: true,
  },
  {
    name: 'View has magictest h1 heading',
    fn: () => {
      const result = View({})
      return is.arr(result) && result.some(el => el.includes('<h1 id="magictest">'))
    },
    expect: true,
  },
  {
    name: 'View has getting-started section',
    fn: () => {
      const result = View({})
      return is.arr(result) && result.some(el => el.includes('id="getting-started"'))
    },
    expect: true,
  },
  {
    name: 'View has code blocks',
    fn: () => {
      const result = View({})
      const pres = result.filter(el => el.includes('<pre') || el.includes('Pre'))
      return is.arr(result) && pres.length > 0
    },
    expect: true,
  },
] satisfies Test[]
