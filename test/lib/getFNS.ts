import { getFNS } from '../../src/lib/getFNS.js'
import type { TestCase } from '../../src/types.js'

export default [
  {
    fn: () => getFNS({}),
    expect: '',
    info: 'returns empty string when no FN env var',
  },
  {
    fn: () => getFNS({ FN: '' }),
    expect: '',
    info: 'returns empty string for empty FN',
  },
  {
    fn: () => getFNS({ FN: 'single' }),
    expect: 'single',
    info: 'returns single function name without space',
  },
  {
    fn: () => getFNS({ FN: 'fn1,fn2,fn3' }),
    expect: 'fn1,fn2,fn3',
    info: 'returns comma-separated string as-is (no space trigger)',
  },
  {
    fn: () => getFNS({ FN: 'fn1;fn2' }),
    expect: 'fn1;fn2',
    info: 'returns semicolon-separated string as-is (no space trigger)',
  },
  {
    fn: () => getFNS({ FN: 'fn1 fn2' }),
    expect: ['fn1', 'fn2'],
    info: 'splits by space/comma/semicolon when space present',
  },
  {
    fn: () => getFNS({ FN: 'fn1 fn2 fn3' }),
    expect: ['fn1', 'fn2', 'fn3'],
    info: 'splits by space for multiple names',
  },
  {
    fn: () => getFNS({ FN: 'fn1 fn2,fn3' }),
    expect: ['fn1', 'fn2', 'fn3'],
    info: 'splits by space and comma (all delimiters)',
  },
  {
    fn: () => getFNS({ FN: 'fn1 fn2;fn3' }),
    expect: ['fn1', 'fn2', 'fn3'],
    info: 'splits by space and semicolon (all delimiters)',
  },
  {
    fn: () => getFNS({ FN: '  fn1  fn2  ' }),
    expect: ['fn1', 'fn2'],
    info: 'handles extra whitespace',
  },
] satisfies TestCase[]
