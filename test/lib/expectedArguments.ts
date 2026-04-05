import { is } from '../../src/index.js'
import { expectedArguments } from '../../src/lib/expectedArguments.js'

const ea = expectedArguments as any

export default [
  { fn: () => ea(() => {}), expect: is.array },
  { fn: () => ea(() => {}), expect: is.empty },
  { fn: () => ea((_a: unknown) => {}), expect: is.array },
  { fn: () => ea((_a: unknown) => {}), expect: is.length.eq(1) },
  { fn: () => ea((_a: unknown, _b: unknown) => {}), expect: is.len.eq(2) },
  { fn: () => ea((_a: unknown, _b: unknown, _c: unknown) => {}), expect: is.len.eq(3) },
  { fn: () => ea(), expect: is.array },
  { fn: () => ea(), expect: is.empty },
  { fn: () => ea(''), expect: is.array },
  { fn: () => ea(''), expect: is.empty },
  {
    fn: () => ea((a: unknown, b: unknown, c = 0) => {}),
    expect: is.len.eq(3),
    info: 'Also works with argument default values',
  },
  {
    fn: () => ea((a: unknown, b: unknown, ...c: unknown[]) => {}),
    expect: is.len.eq(3),
    info: 'Also works with spread arguments',
  },
  {
    fn: () => ea(function (a: unknown, b: unknown, c: unknown) {}),
    expect: is.len.eq(3),
  },
  {
    fn: () => ea(function () {}),
    expect: is.empty,
  },
  {
    fn: () => {
      const args = ea(function ({ a, b }: any) {})
      return args.length > 1 && args[0].includes('{ a')
    },
    expect: true,
    info: 'extracts destructured object argument',
  },
  {
    fn: () => {
      const args = ea(function ([a, b]: any) {})
      return args.length > 1 && args[0].includes('[a')
    },
    expect: true,
    info: 'extracts destructured array argument',
  },
  {
    fn: () => ea(42),
    expect: is.empty,
    info: 'returns empty array for number input',
  },
  {
    fn: () => ea({}),
    expect: is.empty,
    info: 'returns empty array for object input',
  },
  {
    fn: () => ea(function namedFunction(a: unknown, b: unknown) {}),
    expect: is.len.eq(2),
    info: 'extracts arguments from named function',
  },
  {
    fn: () => ea((a = 'default', b = 123) => {}),
    expect: is.len.eq(2),
    info: 'extracts arguments with various default values',
  },
]
