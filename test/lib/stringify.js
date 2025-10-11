import { stringify } from '../../src/lib/stringify.js'

export default [
  { fn: stringify, expect: undefined, info: 'empty argument returns argument' },
  { fn: stringify(false), expect: false, info: '"false" as argument returns "false"' },
  { fn: stringify(true), expect: true, info: '"true" as argument returns "true"' },
  { fn: stringify({}), expect: {}, info: 'empty object returns empty object' },
  { fn: stringify([]), expect: [], info: 'empty array returns empty array' },
  {
    fn: stringify(['testing', () => {}]),
    expect: ['testing', '() => {}'],
    info: 'empty array returns empty array',
  },
  {
    fn: stringify({ testing: true, fn: () => {} }),
    expect: { testing: true, fn: '() => {}' },
    info: 'functions get stringified',
  },
]
