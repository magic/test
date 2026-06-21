import { is } from '../../src/index.js'
import { expectedArguments } from '../../src/lib/expectedArguments.js'
import type { TestCase } from '../../src/types.js'

export default [
  // Basic cases
  { fn: () => expectedArguments(() => {}), expect: is.array },
  { fn: () => expectedArguments(() => {}), expect: is.empty },
  { fn: () => expectedArguments((_a: unknown) => {}), expect: is.array },
  { fn: () => expectedArguments((_a: unknown) => {}), expect: is.len.eq(1) },
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
    info: 'works with argument default values',
  },
  {
    fn: () => expectedArguments((_a: unknown, _b: unknown, ..._c: unknown[]) => {}),
    expect: is.len.eq(3),
    info: 'works with spread arguments',
  },
  {
    fn: () => expectedArguments(function (_a: unknown, _b: unknown, _c: unknown) {}),
    expect: is.len.eq(3),
  },
  {
    fn: () => expectedArguments(function () {}),
    expect: is.empty,
  },
  // Destructured arguments
  {
    fn: () => {
      const args = expectedArguments(function ({ a, b }: { a: unknown; b: unknown }) {
        const _c = (a as number) + (b as number)
      })
      return args.length
    },
    expect: 2,
    info: 'extracts destructured object argument - length',
  },
  {
    fn: () => {
      const args = expectedArguments(function ({ a, b }: { a: unknown; b: unknown }) {
        const _c = (a as number) + (b as number)
      })
      return args[0]?.includes('{ a')
    },
    expect: true,
    info: 'extracts destructured object argument - includes',
  },
  {
    fn: () => {
      const args = expectedArguments(function ([a, b]: [unknown, unknown]) {
        const _c = (a as number) + (b as number)
      })
      return args.length
    },
    expect: 2,
    info: 'extracts destructured array argument - length',
  },
  {
    fn: () => {
      const args = expectedArguments(function ([a, b]: [unknown, unknown]) {
        const _c = (a as number) + (b as number)
      })
      return args[0]?.includes('[a')
    },
    expect: true,
    info: 'extracts destructured array argument - includes',
  },
  // Edge cases
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
  {
    fn: () => expectedArguments((a: number, b: number) => a + b),
    expect: is.len.eq(2),
    info: 'arrow function without parens around single arg',
  },
  {
    fn: () => {
      const args = expectedArguments((_a: string) => {
        return 'hello'
      })
      return args.length
    },
    expect: 1,
    info: 'arrow function with block body returns 1 arg',
  },
  {
    fn: () => {
      const args = expectedArguments(async (_a: unknown, _b: unknown) => {})
      return args.length
    },
    expect: 2,
    info: 'async arrow function extracts args',
  },
  {
    fn: () => {
      const args = expectedArguments((_a: unknown, _b: unknown, ..._rest: unknown[]) => {})
      return args[2] === '..._rest'
    },
    expect: true,
    info: 'spread argument includes ... in name',
  },
  // Destructuring with underscore prefix handling
  {
    fn: () => {
      const args = expectedArguments(([_a]: [unknown]) => {})
      return args[0]
    },
    expect: '[a]',
    info: 'handles array destructuring with underscore prefix',
  },
  {
    fn: () => {
      const args = expectedArguments(({ _a }: { _a: unknown }) => {})
      return args[0]
    },
    expect: '{ _a }',
    info: 'handles object destructuring with underscore prefix (spaces preserved by TS)',
  },
  // Generator function
  {
    fn: () => {
      const args = expectedArguments(function* (_a: unknown, _b: unknown) {})
      return args.length
    },
    expect: 2,
    info: 'extracts arguments from generator function',
  },
  // Uncovered branches - underscore prefix in destructuring (lines 37-38)
  {
    fn: () => {
      const args = expectedArguments(function (_arg: unknown) {})
      return args[0] === '_arg'
    },
    expect: true,
    info: 'underscore prefix preserved in destructuring',
  },
  {
    fn: () => {
      const args = expectedArguments(function ({ a, b }: { a: unknown; b: unknown }) {
        void a
        void b
      })
      return args[0]
    },
    expect: '{ a',
    info: 'object destructuring without underscore',
  },
] satisfies TestCase[]
