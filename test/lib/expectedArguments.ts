import { expectedArguments } from '#src/lib/expectedArguments.js'
import type { Test } from '#src/types.js'

export default [
  // No arguments
  {
    fn: () => expectedArguments(),
    expect: [],
    info: 'expectedArguments() returns empty array',
  },
  // null argument
  {
    fn: () => expectedArguments(null),
    expect: [],
    info: 'expectedArguments(null) returns empty array',
  },
  // undefined argument
  {
    fn: () => expectedArguments(undefined),
    expect: [],
    info: 'expectedArguments(undefined) returns empty array',
  },
  // non-function argument
  {
    fn: () => expectedArguments(42),
    expect: [],
    info: 'expectedArguments(42) returns empty array',
  },
  // string argument
  {
    fn: () => expectedArguments('not a function'),
    expect: [],
    info: 'expectedArguments("not a function") returns empty array',
  },
  // object argument
  {
    fn: () => expectedArguments({}),
    expect: [],
    info: 'expectedArguments({}) returns empty array',
  },
  // arrow function with no params
  {
    fn: () => expectedArguments(() => {}),
    expect: [],
    info: 'expectedArguments(() => {}) returns empty array',
  },
  // arrow function with single param
  {
    fn: () => expectedArguments((x: unknown) => x),
    expect: ['x'],
    info: 'expectedArguments(x => x) returns ["x"]',
  },
  // arrow function with multiple params
  {
    fn: () => expectedArguments((_a: unknown, _b: unknown) => {}),
    expect: ['_a', '_b'],
    info: 'expectedArguments((a, b) => {}) returns ["a", "b"]',
  },
  // arrow function with single param returning expression
  {
    fn: () => expectedArguments((x: number) => x + 1),
    expect: ['x'],
    info: 'expectedArguments(x => x + 1) returns ["x"]',
  },
  // arrow function with two params returning expression
  {
    fn: () => expectedArguments((a: number, b: number) => a + b),
    expect: ['a', 'b'],
    info: 'expectedArguments((a, b) => a + b) returns ["a", "b"]',
  },
  // arrow function with underscore-prefixed param (not stripped for regular params)
  {
    fn: () =>
      expectedArguments((_a: unknown, b: unknown) => {
        return b
      }),
    expect: ['_a', 'b'],
    info: 'expectedArguments((_a, b) => {}) keeps _ prefix for regular params',
  },
  // arrow function with double underscore-prefixed param
  {
    fn: () =>
      expectedArguments((__a: unknown, b: unknown) => {
        return b
      }),
    expect: ['__a', 'b'],
    info: 'expectedArguments((__a, b) => {}) keeps __ prefix for regular params',
  },
  // regular function expression
  {
    fn: () =>
      expectedArguments(function (a: number, b: number) {
        return a + b
      }),
    expect: ['a', 'b'],
    info: 'expectedArguments(function(a, b) {}) returns ["a", "b"]',
  },
  // regular function with no params
  {
    fn: () => expectedArguments(function () {}),
    expect: [],
    info: 'expectedArguments(function() {}) returns empty array',
  },
  // arrow function with default param
  {
    fn: () =>
      expectedArguments((a = 1, b: number) => {
        return a + b
      }),
    expect: ['a = 1', 'b'],
    info: 'expectedArguments((a = 1, b) => {}) includes default value',
  },
  // arrow function with rest param
  {
    fn: () => expectedArguments((..._args: unknown[]) => {}),
    expect: ['..._args'],
    info: 'expectedArguments((...args) => {}) returns ["...args"]',
  },
  // arrow function with single char param
  {
    fn: () => expectedArguments((a: unknown) => a),
    expect: ['a'],
    info: 'expectedArguments(a => a) returns ["a"]',
  },
  // arrow function with multi-char param
  {
    fn: () =>
      expectedArguments((foo: unknown, bar: unknown) => {
        return [foo, bar]
      }),
    expect: ['foo', 'bar'],
    info: 'expectedArguments((foo, bar) => {}) returns ["foo", "bar"]',
  },
  // arrow function with whitespace
  {
    fn: () =>
      expectedArguments((a: number, b: number) => {
        return a + b
      }),
    expect: ['a', 'b'],
    info: 'expectedArguments(( a , b ) => {}) trims whitespace',
  },
] satisfies Test[]
