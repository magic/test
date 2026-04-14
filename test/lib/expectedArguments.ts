import { is } from '../../src/index.js'
import { expectedArguments } from '../../src/lib/expectedArguments.js'

export default [
  { fn: () => expectedArguments(() => {}), expect: is.array },
  { fn: () => expectedArguments(() => {}), expect: is.empty },
  { fn: () => expectedArguments((_a: unknown) => {}), expect: is.array },
  { fn: () => expectedArguments((_a: unknown) => {}), expect: is.length.eq(1) },
  { fn: () => expectedArguments((_a: unknown, _b: unknown) => {}), expect: is.len.eq(2) },
  {
    fn: () => expectedArguments((_a: unknown, _b: unknown, _c: unknown) => {}),
    expect: is.len.eq(3),
  },
  { fn: () => expectedArguments(), expect: is.array },
  { fn: () => expectedArguments(), expect: is.empty },
  { fn: () => expectedArguments(''), expect: is.array },
  { fn: () => expectedArguments(''), expect: is.empty },
  {
    fn: () => expectedArguments((_a: unknown, _b: unknown, _c = 0) => {}),
    expect: is.len.eq(3),
    info: 'Also works with argument default values',
  },
  {
    fn: () => expectedArguments((_a: unknown, _b: unknown, ..._c: unknown[]) => {}),
    expect: is.len.eq(3),
    info: 'Also works with spread arguments',
  },
  {
    fn: () => expectedArguments(function (_a: unknown, _b: unknown, _c: unknown) {}),
    expect: is.len.eq(3),
  },
  {
    fn: () => expectedArguments(function () {}),
    expect: is.empty,
  },
  {
    fn: () => {
      const args = expectedArguments(function ({ a, b }: unknown) {
        const _c = a + b
      })
      return args.length > 1 && args[0]?.includes('{ a')
    },
    expect: true,
    info: 'extracts destructured object argument',
  },
  {
    fn: () => {
      const args = expectedArguments(function ([a, b]: unknown) {
        const _c = a + b
      })
      return args.length > 1 && args[0]?.includes('[a')
    },
    expect: true,
    info: 'extracts destructured array argument',
  },
  {
    fn: () => expectedArguments(42),
    expect: is.empty,
    info: 'returns empty array for number input',
  },
  {
    fn: () => expectedArguments({}),
    expect: is.empty,
    info: 'returns empty array for object input',
  },
  {
    fn: () => expectedArguments(function namedFunction(_a: unknown, _b: unknown) {}),
    expect: is.len.eq(2),
    info: 'extracts arguments from named function',
  },
  {
    fn: () => expectedArguments((_a = 'default', _b = 123) => {}),
    expect: is.len.eq(2),
    info: 'extracts arguments with various default values',
  },
]
