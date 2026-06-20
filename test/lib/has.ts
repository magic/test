import {
  property,
  properties,
  any,
  nested,
  string,
  key,
  keys,
  includes,
  oneOf,
  matches,
} from '../../src/lib/has.js'
import type { TestCase } from '../../src/types.js'

const isStr = (v: unknown): boolean => typeof v === 'string'
const isNum = (v: unknown): boolean => typeof v === 'number'

export default [
  {
    fn: () => property('a', isStr)({ a: 'hello' }),
    expect: true,
    info: 'property returns true when key exists and predicate passes',
  },
  {
    fn: () => property('a', isStr)({ a: 123 }),
    expect: false,
    info: 'property returns false when key exists but predicate fails',
  },
  {
    fn: () => property('a', isStr)({}),
    expect: false,
    info: 'property returns false when key does not exist',
  },
  {
    fn: () => property('a', isStr)(null),
    expect: false,
    info: 'property returns false when result is null',
  },
  {
    fn: () => property('a', isStr)(undefined),
    expect: false,
    info: 'property returns false when result is undefined',
  },
  {
    fn: () => property('a', isStr)('string'),
    expect: false,
    info: 'property returns false when result is a string',
  },
  {
    fn: () => property('a', isStr)(123),
    expect: false,
    info: 'property returns false when result is a number',
  },
  {
    fn: () => property('a', isStr)(true),
    expect: false,
    info: 'property returns false when result is a boolean',
  },

  {
    fn: () => properties({ a: isStr, b: isNum })({ a: 'hello', b: 123 }),
    expect: true,
    info: 'properties returns true when all keys exist and predicates pass',
  },
  {
    fn: () => properties({ a: isStr, b: isNum })({ a: 'hello', b: 'wrong' }),
    expect: false,
    info: 'properties returns false when one predicate fails',
  },
  {
    fn: () => properties({ a: isStr, b: isNum })({ a: 'hello' }),
    expect: false,
    info: 'properties returns false when key does not exist',
  },
  {
    fn: () => properties({})(null),
    expect: false,
    info: 'properties returns false when result is null',
  },
  {
    fn: () => properties({})(undefined),
    expect: false,
    info: 'properties returns false when result is undefined',
  },
  {
    fn: () => properties({})('string'),
    expect: false,
    info: 'properties returns false when result is a string',
  },
  {
    fn: () => properties({ a: isStr })({ a: 'hello' }),
    expect: true,
    info: 'properties works with single key spec',
  },
  {
    fn: () => properties({})({}),
    expect: true,
    info: 'properties returns true for empty spec with object result',
  },

  {
    fn: () => any({ a: isStr, b: isNum })({ a: 'hello' }),
    expect: true,
    info: 'any returns true when one key matches',
  },
  {
    fn: () => any({ a: isStr, b: isNum })({ a: 'hello', b: 123 }),
    expect: true,
    info: 'any returns true when multiple keys match',
  },
  {
    fn: () => any({ a: isStr, b: isNum })({ a: 1, c: 2 }),
    expect: false,
    info: 'any returns false when no keys match predicates',
  },
  {
    fn: () => any({ a: isStr, b: isNum })({ a: 'hello', b: 'wrong' }),
    expect: true,
    info: 'any returns true when at least one key matches',
  },
  {
    fn: () => any({ a: isStr })({}),
    expect: false,
    info: 'any returns false when no keys exist',
  },
  {
    fn: () => any({})({}),
    expect: false,
    info: 'any returns false for empty spec',
  },
  {
    fn: () => any({ a: isStr })(null),
    expect: false,
    info: 'any returns false when result is null',
  },
  {
    fn: () => any({ a: isStr })('string'),
    expect: false,
    info: 'any returns false when result is a string',
  },

  {
    fn: () => nested('a.b', isStr)({ a: { b: 'hello' } }),
    expect: true,
    info: 'nested returns true when path exists and predicate passes',
  },
  {
    fn: () => nested('a.b', isStr)({ a: { b: 123 } }),
    expect: false,
    info: 'nested returns false when path exists but predicate fails',
  },
  {
    fn: () => nested('a.b.c', isStr)({ a: { b: { c: 'deep' } } }),
    expect: true,
    info: 'nested works with deep paths',
  },
  {
    fn: () => nested('a.b', isStr)({ a: {} }),
    expect: false,
    info: 'nested returns false when path partially exists',
  },
  {
    fn: () => nested('a.b', isStr)({}),
    expect: false,
    info: 'nested returns false when path does not exist',
  },
  {
    fn: () => nested('a', isStr)({ a: 'hello' }),
    expect: true,
    info: 'nested works with single key path',
  },
  {
    fn: () => nested('a.b', isStr)(null),
    expect: false,
    info: 'nested returns false when result is null',
  },
  {
    fn: () => nested('a.b', isStr)(undefined),
    expect: false,
    info: 'nested returns false when result is undefined',
  },
  {
    fn: () => nested('a.b', isStr)('string'),
    expect: false,
    info: 'nested returns false when result is a string',
  },
  {
    fn: () => nested('a.b', isStr)({ a: null }),
    expect: false,
    info: 'nested returns false when path contains null',
  },
  {
    fn: () => nested('a.b', isStr)({ a: 1 }),
    expect: false,
    info: 'nested returns false when path contains non-object',
  },

  // has.string tests
  {
    fn: () => string('hello')('hello world'),
    expect: true,
    info: 'string returns true when substring found',
  },
  {
    fn: () => string('hello')('world'),
    expect: false,
    info: 'string returns false when substring not found',
  },
  {
    fn: () => string('hello')(123),
    expect: false,
    info: 'string returns false when value is not a string',
  },
  {
    fn: () => string('hello')(null),
    expect: false,
    info: 'string returns false when value is null',
  },
  {
    fn: () => string('hello')(undefined),
    expect: false,
    info: 'string returns false when value is undefined',
  },
  {
    fn: () => string('')(''),
    expect: true,
    info: 'string returns true for empty substring',
  },

  // has.key tests
  {
    fn: () => key('a')({ a: 1, b: 2 }),
    expect: true,
    info: 'key returns true when key exists',
  },
  {
    fn: () => key('c')({ a: 1, b: 2 }),
    expect: false,
    info: 'key returns false when key does not exist',
  },
  {
    fn: () => key('a')({}),
    expect: false,
    info: 'key returns false for empty object',
  },
  {
    fn: () => key('a')(null),
    expect: false,
    info: 'key returns false when result is null',
  },
  {
    fn: () => key('a')('string'),
    expect: false,
    info: 'key returns false when result is a string',
  },

  // has.keys tests
  {
    fn: () => keys(['a', 'b'])({ a: 1, b: 2, c: 3 }),
    expect: true,
    info: 'keys returns true when all keys exist',
  },
  {
    fn: () => keys(['a', 'c'])({ a: 1, b: 2 }),
    expect: false,
    info: 'keys returns false when one key missing',
  },
  {
    fn: () => keys([])({ a: 1 }),
    expect: true,
    info: 'keys returns true for empty key array',
  },
  {
    fn: () => keys(['a'])(null),
    expect: false,
    info: 'keys returns false when result is null',
  },
  {
    fn: () => keys(['a'])([]),
    expect: false,
    info: 'keys returns false when result is an array',
  },

  // Literal value tests for property
  {
    fn: () => property('count', 5)({ count: 5 }),
    expect: true,
    info: 'property accepts literal number value',
  },
  {
    fn: () => property('count', 5)({ count: 6 }),
    expect: false,
    info: 'property returns false when literal number does not match',
  },
  {
    fn: () => property('name', 'John')({ name: 'John' }),
    expect: true,
    info: 'property accepts literal string value',
  },
  {
    fn: () => property('name', 'John')({ name: 'Jane' }),
    expect: false,
    info: 'property returns false when literal string does not match',
  },
  {
    fn: () => property('user', { name: 'John', age: 30 })({ user: { name: 'John', age: 30 } }),
    expect: true,
    info: 'property uses deep.equal for objects',
  },
  {
    fn: () => property('user', { name: 'John' })({ user: { name: 'John', age: 30 } }),
    expect: false,
    info: 'property returns false for partial object match',
  },

  // Literal value tests for properties
  {
    fn: () => properties({ a: 'value', b: 5 })({ a: 'value', b: 5 }),
    expect: true,
    info: 'properties accepts literal values for all keys',
  },
  {
    fn: () => properties({ a: 'value', b: 5 })({ a: 'value', b: 6 }),
    expect: false,
    info: 'properties returns false when any literal does not match',
  },

  // Mixed predicates and literals
  {
    fn: () => properties({ a: isStr, b: 5 })({ a: 'test', b: 5 }),
    expect: true,
    info: 'properties works with mixed predicates and literals',
  },
  {
    fn: () => properties({ a: isStr, b: 5 })({ a: 'test', b: 6 }),
    expect: false,
    info: 'properties fails when mixed literal does not match',
  },

  // Literal value tests for any
  {
    fn: () => any({ error: 'not found', data: null })({ error: 'not found' }),
    expect: true,
    info: 'any accepts literal values',
  },
  {
    fn: () => any({ error: 'not found', data: null })({ data: null }),
    expect: true,
    info: 'any matches any literal value',
  },
  {
    fn: () => any({ error: 'not found', data: null })({ other: 'value' }),
    expect: false,
    info: 'any returns false when no literals match',
  },

  // has.includes tests
  {
    fn: () => includes('a')(['a', 'b', 'c']),
    expect: true,
    info: 'includes returns true for array with item',
  },
  {
    fn: () => includes({ a: 1 })([{ a: 1 }, { b: 2 }]),
    expect: true,
    info: 'includes uses deep.equal for objects in array',
  },
  {
    fn: () => includes('a')(['A', 'B', 'C']),
    expect: false,
    info: 'includes is case sensitive',
  },
  {
    fn: () => includes('d')(['a', 'b', 'c']),
    expect: false,
    info: 'includes returns false for array without item',
  },
  {
    fn: () => includes('ello')('hello world'),
    expect: true,
    info: 'includes returns true for string containing substring',
  },
  {
    fn: () => includes('xyz')('hello world'),
    expect: false,
    info: 'includes returns false for string not containing substring',
  },
  {
    fn: () => includes('a')(123),
    expect: false,
    info: 'includes returns false for non-array/string number',
  },
  {
    fn: () => includes('a')(null),
    expect: false,
    info: 'includes returns false for null',
  },

  // has.oneOf tests
  {
    fn: () => oneOf(['a', 'b', 'c'])('b'),
    expect: true,
    info: 'oneOf returns true when value is in options',
  },
  {
    fn: () => oneOf(['a', 'b', 'c'])('d'),
    expect: false,
    info: 'oneOf returns false when value is not in options',
  },
  {
    fn: () => oneOf([1, 2, 3])(2),
    expect: true,
    info: 'oneOf works with numbers',
  },
  {
    fn: () => oneOf([{ a: 1 }, { b: 2 }])({ a: 1 }),
    expect: true,
    info: 'oneOf works with objects using deep.equal',
  },
  {
    fn: () => oneOf([])(null),
    expect: false,
    info: 'oneOf returns false for empty options',
  },
  {
    fn: () => oneOf(['a', 'b'])(123),
    expect: false,
    info: 'oneOf returns false for number not in options',
  },

  // has.matches tests
  {
    fn: () => matches(/^\d{3}-\d{4}$/)('123-4567'),
    expect: true,
    info: 'matches returns true for matching regex',
  },
  {
    fn: () => matches(/^\d{3}-\d{4}$/)('123-45678'),
    expect: false,
    info: 'matches returns false for non-matching regex',
  },
  {
    fn: () => matches(/hello/)('hello world'),
    expect: true,
    info: 'matches works with simple pattern',
  },
  {
    fn: () => matches(/hello/)('goodbye'),
    expect: false,
    info: 'matches returns false when pattern not found',
  },
  {
    fn: () => matches(/test/)(123),
    expect: false,
    info: 'matches returns false for non-string',
  },
  {
    fn: () => matches(/test/)(null),
    expect: false,
    info: 'matches returns false for null',
  },
] satisfies TestCase[]
