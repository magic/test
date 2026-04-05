import is from '@magic/types'
import { getFNS } from '../../src/lib/getFNS.js'

export default [
  {
    fn: () => getFNS,
    expect: is.fn,
    info: 'getFNS is a function',
  },
  {
    fn: () => getFNS({}),
    expect: '',
    info: 'returns empty string when FN is not set',
  },
  {
    fn: () => getFNS({ FN: 'testFn' }),
    expect: 'testFn',
    info: 'returns FN value as string when no spaces',
  },
  {
    fn: () => getFNS({ FN: 'fn1, fn2' }),
    expect: is.array,
    info: 'returns array when FN contains spaces',
  },
]
