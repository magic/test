import type { TestCase } from '../src/types.js'

export default [
  {
    fn: () => true,
    expect: true,
    info: 'constant true',
  },
  {
    fn: () => false,
    expect: false,
    info: 'constant false',
  },
  {
    fn: async () => await new Promise(r => r(true)),
    expect: true,
    info: 'async Promise resolve',
  },
  {
    fn: () => 1,
    expect: 1,
    info: 'number constant',
  },
  {
    fn: () => 'hello',
    expect: 'hello',
    info: 'string constant',
  },
  {
    fn: () => null,
    expect: null,
    info: 'null constant',
  },
  {
    fn: () => undefined,
    expect: undefined,
    info: 'undefined constant',
  },
] satisfies TestCase[]
