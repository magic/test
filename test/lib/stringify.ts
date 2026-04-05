import { stringify } from '../../src/lib/stringify.js'

const longString = 'a'.repeat(100)

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
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      delete process.env.MAGIC_TEST_ERROR_LENGTH
      const result = (stringify(longString) as string).length
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: 70,
    info: 'strings truncate to 70 by default',
  },
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      process.env.MAGIC_TEST_ERROR_LENGTH = '50'
      const result = (stringify(longString) as string).length
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: 50,
    info: 'strings truncate to errorLength when set',
  },
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      process.env.MAGIC_TEST_ERROR_LENGTH = '0'
      const result = (stringify(longString) as string).length
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: 100,
    info: 'strings do not truncate when errorLength is 0',
  },
]
