import is from '@magic/types'
import {
  has,
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
  at,
  not,
} from '#lib/has.js'
import type { TestCase } from '#src/types.js'

export default [
  {
    fn: () => property('a', is.string)({ a: 'hello' }),
    expect: true,
    info: 'property returns true when key exists and predicate passes',
  },
  {
    fn: () => property('a', is.string)({ a: 123 }),
    expect: false,
    info: 'property returns false when key exists but predicate fails',
  },
  {
    fn: () => property('a', is.string)({}),
    expect: false,
    info: 'property returns false when key does not exist',
  },
  {
    fn: () => property('a', is.string)(null),
    expect: false,
    info: 'property returns false when result is null',
  },
  {
    fn: () => property('a', is.string)(undefined),
    expect: false,
    info: 'property returns false when result is undefined',
  },
  {
    fn: () => property('a', is.string)('string'),
    expect: false,
    info: 'property returns false when result is a string',
  },
  {
    fn: () => property('a', is.string)(123),
    expect: false,
    info: 'property returns false when result is a number',
  },
  {
    fn: () => property('a', is.string)(true),
    expect: false,
    info: 'property returns false when result is a boolean',
  },

  {
    fn: () => properties({ a: is.string, b: is.number })({ a: 'hello', b: 123 }),
    expect: true,
    info: 'properties returns true when all keys exist and predicates pass',
  },
  {
    fn: () => properties({ a: is.string, b: is.number })({ a: 'hello', b: 'wrong' }),
    expect: false,
    info: 'properties returns false when one predicate fails',
  },
  {
    fn: () => properties({ a: is.string, b: is.number })({ a: 'hello' }),
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
    fn: () => properties({ a: is.string })({ a: 'hello' }),
    expect: true,
    info: 'properties works with single key spec',
  },
  {
    fn: () => properties({})({}),
    expect: true,
    info: 'properties returns true for empty spec with object result',
  },

  {
    fn: () => any({ a: is.string, b: is.number })({ a: 'hello' }),
    expect: true,
    info: 'any returns true when one key matches',
  },
  {
    fn: () => any({ a: is.string, b: is.number })({ a: 'hello', b: 123 }),
    expect: true,
    info: 'any returns true when multiple keys match',
  },
  {
    fn: () => any({ a: is.string, b: is.number })({ a: 1, c: 2 }),
    expect: false,
    info: 'any returns false when no keys match predicates',
  },
  {
    fn: () => any({ a: is.string, b: is.number })({ a: 'hello', b: 'wrong' }),
    expect: true,
    info: 'any returns true when at least one key matches',
  },
  {
    fn: () => any({ a: is.string })({}),
    expect: false,
    info: 'any returns false when no keys exist',
  },
  {
    fn: () => any({})({}),
    expect: false,
    info: 'any returns false for empty spec',
  },
  {
    fn: () => any({ a: is.string })(null),
    expect: false,
    info: 'any returns false when result is null',
  },
  {
    fn: () => any({ a: is.string })('string'),
    expect: false,
    info: 'any returns false when result is a string',
  },

  {
    fn: () => nested('a.b', is.string)({ a: { b: 'hello' } }),
    expect: true,
    info: 'nested returns true when path exists and predicate passes',
  },
  {
    fn: () => nested('a.b', is.string)({ a: { b: 123 } }),
    expect: false,
    info: 'nested returns false when path exists but predicate fails',
  },
  {
    fn: () => nested('a.b.c', is.string)({ a: { b: { c: 'deep' } } }),
    expect: true,
    info: 'nested works with deep paths',
  },
  {
    fn: () => nested('a.b', is.string)({ a: {} }),
    expect: false,
    info: 'nested returns false when path partially exists',
  },
  {
    fn: () => nested('a.b', is.string)({}),
    expect: false,
    info: 'nested returns false when path does not exist',
  },
  {
    fn: () => nested('a', is.string)({ a: 'hello' }),
    expect: true,
    info: 'nested works with single key path',
  },
  {
    fn: () => nested('a.b', is.string)(null),
    expect: false,
    info: 'nested returns false when result is null',
  },
  {
    fn: () => nested('a.b', is.string)(undefined),
    expect: false,
    info: 'nested returns false when result is undefined',
  },
  {
    fn: () => nested('a.b', is.string)('string'),
    expect: false,
    info: 'nested returns false when result is a string',
  },
  {
    fn: () => nested('a.b', is.string)({ a: null }),
    expect: false,
    info: 'nested returns false when path contains null',
  },
  {
    fn: () => nested('a.b', is.string)({ a: 1 }),
    expect: false,
    info: 'nested returns false when path contains non-object',
  },

  // Literal value tests for nested
  {
    fn: () => nested('textContent', 'Simple content')({ textContent: 'Simple content' }),
    expect: true,
    info: 'nested accepts literal string value',
  },
  {
    fn: () => nested('textContent', 'Simple content')({ textContent: 'Other content' }),
    expect: false,
    info: 'nested returns false when literal string does not match',
  },
  {
    fn: () => nested('a.count', 5)({ a: { count: 5 } }),
    expect: true,
    info: 'nested accepts literal number value',
  },
  {
    fn: () => nested('a.count', 5)({ a: { count: 6 } }),
    expect: false,
    info: 'nested returns false when literal number does not match',
  },
  {
    fn: () =>
      nested('a.user', { name: 'John', age: 30 })({ a: { user: { name: 'John', age: 30 } } }),
    expect: true,
    info: 'nested uses deep.equal for object literals',
  },
  {
    fn: () => nested('a.user', { name: 'John' })({ a: { user: { name: 'John', age: 30 } } }),
    expect: false,
    info: 'nested returns false for partial object literal match',
  },
  {
    fn: () =>
      nested(
        '0.textContent',
        'Object in array 1',
      )([{ textContent: 'Object in array 1' }, { textContent: 'Object in array 2' }]),
    expect: true,
    info: 'nested works with array index paths and literals',
  },
  {
    fn: () =>
      nested(
        '0.textContent',
        'Object in array 2',
      )([{ textContent: 'Object in array 1' }, { textContent: 'Object in array 2' }]),
    expect: false,
    info: 'nested returns false when array index path literal does not match',
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
    fn: () => string('hello', 'world')('hello world'),
    expect: true,
    info: 'string arguments can be arrays',
  },
  {
    fn: () => string('hello2', 'world')('hello world'),
    expect: false,
    info: 'string arguments can be arrays but if one fails, the function fails',
  },
  {
    // @ts-expect-error make sure we also handle numbers, even if typecheck fails
    fn: () => string(23, 'world')('hello world 23'),
    expect: true,
    info: 'string arguments can be arrays and values can include numbers',
  },
  {
    // @ts-expect-error make sure we also handle numbers, even if typecheck fails
    fn: () => string(24, 'world')('hello world 23'),
    expect: false,
    info: 'strings can be arrays and include numbers, but if one fails, the function fails',
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

  // has.string predicate tests
  {
    fn: () => string(s => s.includes('a') && s.includes('z'))('hello a to z'),
    expect: true,
    info: 'string accepts a predicate checking multiple conditions',
  },
  {
    fn: () => string(s => s.includes('a') && s.includes('z'))('hello'),
    expect: false,
    info: 'string predicate returns false when a condition does not hold',
  },
  {
    fn: () => string(s => s.length > 3)('hello'),
    expect: true,
    info: 'string predicate receives the full string',
  },
  {
    fn: () => string(s => s.length > 0)(123),
    expect: false,
    info: 'string returns false for non-string result with predicate',
  },
  {
    fn: () => string(s => s.length > 0)(null),
    expect: false,
    info: 'string returns false for null result with predicate',
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
    fn: () => properties({ a: is.string, b: 5 })({ a: 'test', b: 5 }),
    expect: true,
    info: 'properties works with mixed predicates and literals',
  },
  {
    fn: () => properties({ a: is.string, b: 5 })({ a: 'test', b: 6 }),
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
  {
    fn: () => includes('a', 'b', 'c')(['a', 'b', 'c']),
    expect: true,
    info: 'includes test arguments can be an array',
  },
  {
    fn: () => includes('a', 'b', 'd')(['a', 'b', 'c']),
    expect: false,
    info: 'includes accepts array, but if one item fails, it returns false',
  },

  // has.includes predicate tests
  {
    fn: () => includes((v: unknown) => is.number(v) && v > 5)([1, 3, 7]),
    expect: true,
    info: 'includes accepts a predicate for array elements',
  },
  {
    fn: () => includes((v: unknown) => is.number(v) && v > 5)([1, 3, 4]),
    expect: false,
    info: 'includes predicate returns false when no element matches',
  },
  {
    fn: () => includes((v: unknown) => v === 'a')('not an array'),
    expect: false,
    info: 'includes returns false for string result with predicate',
  },
  {
    fn: () => includes((v: unknown) => v === 'a')(null),
    expect: false,
    info: 'includes returns false for null result with predicate',
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

  // oneOf multiple arguments tests
  {
    fn: () => oneOf('a', 'b', 'c')('b'),
    expect: true,
    info: 'oneOf returns true when value is in options',
  },
  {
    fn: () => oneOf('a', 'b', 'c')('d'),
    expect: false,
    info: 'oneOf returns false when value is not in options',
  },
  {
    fn: () => oneOf(1, 2, 3)(2),
    expect: true,
    info: 'oneOf works with numbers',
  },
  {
    fn: () => oneOf({ a: 1 }, { b: 2 })({ a: 1 }),
    expect: true,
    info: 'oneOf works with objects using deep.equal',
  },
  {
    fn: () => oneOf()(null),
    expect: false,
    info: 'oneOf returns false for empty options',
  },
  {
    fn: () => oneOf('a', 'b')(123),
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

  // has.at tests (lines 82-89)
  {
    fn: () => at(0, is.string)(['a', 'b', 'c']),
    expect: true,
    info: 'at returns true when index exists and predicate passes',
  },
  {
    fn: () => at(1, is.string)(['a', 2, 'c']),
    expect: false,
    info: 'at returns false when index exists but predicate fails',
  },
  {
    fn: () => at(5, is.string)(['a', 'b']),
    expect: false,
    info: 'at returns false when index out of bounds',
  },
  {
    fn: () => at(0, is.string)(null),
    expect: false,
    info: 'at returns false when result is null (line 83-84)',
  },
  {
    fn: () => at(0, is.string)(undefined),
    expect: false,
    info: 'at returns false when result is undefined',
  },
  {
    fn: () => at(0, is.string)('string'),
    expect: false,
    info: 'at returns false when result is a string',
  },
  {
    fn: () => at(0, is.string)(123),
    expect: false,
    info: 'at returns false when result is a number',
  },
  {
    fn: () => at(0, is.string)({}),
    expect: false,
    info: 'at returns false when result is an object',
  },
  {
    fn: () => at(2, is.string)(['a', 'b', 'c']),
    expect: true,
    info: 'at works with last index in array',
  },
  {
    fn: () => at(1, 'value')(['a', 'value', 'c']),
    expect: true,
    info: 'at accepts literal value check',
  },
  {
    fn: () => at(0, (v: unknown) => v === undefined)([]),
    expect: true,
    info: 'at handles undefined values',
  },
  {
    fn: () => at(-1, is.string)(['a', 'b']),
    expect: false,
    info: 'at returns false for negative index',
  },

  // has.at array-of-checks tests
  {
    fn: () => at(0, [is.string, (v: unknown) => v === 'a'])(['a', 'b', 'c']),
    expect: true,
    info: 'at accepts an array of checks - all pass',
  },
  {
    fn: () => at(0, [is.string, (v: unknown) => v === 'b'])(['a', 'b', 'c']),
    expect: false,
    info: 'at accepts an array of checks - one fails',
  },
  {
    fn: () => at(1, ['value', is.string])(['a', 'value', 'c']),
    expect: true,
    info: 'at array of checks mixes literal value and predicate',
  },
  {
    fn: () => at(5, [is.string])(['a', 'b']),
    expect: false,
    info: 'at array of checks still respects out-of-bounds index',
  },

  // has.not coverage meta-test
  {
    fn: () =>
      Object.keys(not).sort().join(',') ===
      Object.keys(has)
        .filter(k => k !== 'not')
        .sort()
        .join(','),
    expect: true,
    info: 'has.not provides a negated version of every has.* check function',
  },

  // has.not.property tests
  {
    fn: () => not.property('a', is.string)({}),
    expect: true,
    info: 'not.property returns true when key does not exist',
  },
  {
    fn: () => not.property('a', is.string)({ a: 123 }),
    expect: true,
    info: 'not.property returns true when key exists but predicate fails',
  },
  {
    fn: () => not.property('a', is.string)({ a: 'hello' }),
    expect: false,
    info: 'not.property returns false when key exists and predicate passes',
  },
  {
    fn: () => not.property('a', is.string)(null),
    expect: true,
    info: 'not.property returns true when result is null',
  },
  {
    fn: () => not.property('count', 5)({ count: 6 }),
    expect: true,
    info: 'not.property returns true when literal value does not match',
  },
  {
    fn: () => not.property('count', 5)({ count: 5 }),
    expect: false,
    info: 'not.property returns false when literal value matches',
  },

  // has.not.properties tests
  {
    fn: () => not.properties({ a: is.string, b: is.number })({ a: 'hello' }),
    expect: true,
    info: 'not.properties returns true when a key is missing',
  },
  {
    fn: () => not.properties({ a: is.string, b: is.number })({ a: 'hello', b: 'wrong' }),
    expect: true,
    info: 'not.properties returns true when one predicate fails',
  },
  {
    fn: () => not.properties({ a: is.string, b: is.number })({ a: 'hello', b: 123 }),
    expect: false,
    info: 'not.properties returns false when all keys exist and predicates pass',
  },
  {
    fn: () => not.properties({})(null),
    expect: true,
    info: 'not.properties returns true when result is null',
  },
  {
    fn: () => not.properties({})({ a: 1 }),
    expect: false,
    info: 'not.properties returns false for empty spec with object result',
  },
  {
    fn: () => not.properties({ a: 'value' })({ a: 'other' }),
    expect: true,
    info: 'not.properties returns true when literal value does not match',
  },
  {
    fn: () => not.properties({ a: 'value' })({ a: 'value' }),
    expect: false,
    info: 'not.properties returns false when literal value matches',
  },

  // has.not.any tests
  {
    fn: () => not.any({ a: is.string, b: is.number })({ a: 1, c: 2 }),
    expect: true,
    info: 'not.any returns true when no keys match',
  },
  {
    fn: () => not.any({ a: is.string, b: is.number })({ a: 'hello' }),
    expect: false,
    info: 'not.any returns false when one key matches',
  },
  {
    fn: () => not.any({ a: is.string })(null),
    expect: true,
    info: 'not.any returns true when result is null',
  },
  {
    fn: () => not.any({ a: is.string })('string'),
    expect: true,
    info: 'not.any returns true when result is a string',
  },
  {
    fn: () => not.any({ a: 'value' })({ a: 'other' }),
    expect: true,
    info: 'not.any returns true when literal value does not match',
  },
  {
    fn: () => not.any({ a: 'value' })({ a: 'value' }),
    expect: false,
    info: 'not.any returns false when literal value matches',
  },

  // has.not.nested tests
  {
    fn: () => not.nested('a.b', is.string)({ a: { b: 123 } }),
    expect: true,
    info: 'not.nested returns true when path exists but predicate fails',
  },
  {
    fn: () => not.nested('a.b', is.string)({ a: {} }),
    expect: true,
    info: 'not.nested returns true when path partially exists',
  },
  {
    fn: () => not.nested('a.b', is.string)({ a: { b: 'hello' } }),
    expect: false,
    info: 'not.nested returns false when path exists and predicate passes',
  },
  {
    fn: () => not.nested('a.b', is.string)(null),
    expect: true,
    info: 'not.nested returns true when result is null',
  },
  {
    fn: () => not.nested('a.b', is.string)('string'),
    expect: true,
    info: 'not.nested returns true when result is a string',
  },
  {
    fn: () => not.nested('a.b', is.string)({ a: null }),
    expect: true,
    info: 'not.nested returns true when path contains null',
  },
  {
    fn: () => not.nested('a.count', 5)({ a: { count: 6 } }),
    expect: true,
    info: 'not.nested returns true when literal value does not match',
  },
  {
    fn: () => not.nested('a.count', 5)({ a: { count: 5 } }),
    expect: false,
    info: 'not.nested returns false when literal value matches',
  },

  // has.not.string tests
  {
    fn: () => not.string('hello')('world'),
    expect: true,
    info: 'not.string returns true when substring not found',
  },
  {
    fn: () => not.string('hello')('hello world'),
    expect: false,
    info: 'not.string returns false when substring found',
  },
  {
    fn: () => not.string('hello', 'xyz')('hello world'),
    expect: true,
    info: 'not.string returns true when one substring is missing',
  },
  {
    fn: () => not.string('hello', 'world')('hello world'),
    expect: false,
    info: 'not.string returns false when all substrings are found',
  },
  {
    fn: () => not.string('hello')(123),
    expect: true,
    info: 'not.string returns true when value is not a string',
  },
  {
    fn: () => not.string('hello')(null),
    expect: true,
    info: 'not.string returns true when value is null',
  },
  {
    fn: () => not.string((s: string) => s.includes('a'))('hello a to z'),
    expect: false,
    info: 'not.string returns false when predicate passes',
  },
  {
    fn: () => not.string((s: string) => s.includes('a'))('hello'),
    expect: true,
    info: 'not.string returns true when predicate fails',
  },

  // has.not.at tests
  {
    fn: () => not.at(0, is.string)(['a', 'b', 'c']),
    expect: false,
    info: 'not.at returns false when index exists and predicate passes',
  },
  {
    fn: () => not.at(1, is.string)(['a', 2, 'c']),
    expect: true,
    info: 'not.at returns true when index exists but predicate fails',
  },
  {
    fn: () => not.at(5, is.string)(['a', 'b']),
    expect: true,
    info: 'not.at returns true when index out of bounds',
  },
  {
    fn: () => not.at(0, is.string)(null),
    expect: true,
    info: 'not.at returns true when result is null',
  },
  {
    fn: () => not.at(0, is.string)('string'),
    expect: true,
    info: 'not.at returns true when result is a string',
  },
  {
    fn: () => not.at(1, 'value')(['a', 'value', 'c']),
    expect: false,
    info: 'not.at returns false when literal value matches',
  },
  {
    fn: () => not.at(1, 'other')(['a', 'value', 'c']),
    expect: true,
    info: 'not.at returns true when literal value does not match',
  },
  {
    fn: () => not.at(0, [is.string, (v: unknown) => v === 'a'])(['a', 'b', 'c']),
    expect: false,
    info: 'not.at array of checks - returns false when all pass',
  },
  {
    fn: () => not.at(0, [is.string, (v: unknown) => v === 'b'])(['a', 'b', 'c']),
    expect: true,
    info: 'not.at array of checks - returns true when one fails',
  },

  // has.not.key tests
  {
    fn: () => not.key('c')({ a: 1, b: 2 }),
    expect: true,
    info: 'not.key returns true when key does not exist',
  },
  {
    fn: () => not.key('a')({ a: 1, b: 2 }),
    expect: false,
    info: 'not.key returns false when key exists',
  },
  {
    fn: () => not.key('a')({}),
    expect: true,
    info: 'not.key returns true for empty object',
  },
  {
    fn: () => not.key('a')(null),
    expect: true,
    info: 'not.key returns true when result is null',
  },
  {
    fn: () => not.key('a')('string'),
    expect: true,
    info: 'not.key returns true when result is a string',
  },

  // has.not.keys tests
  {
    fn: () => not.keys(['a', 'c'])({ a: 1, b: 2 }),
    expect: true,
    info: 'not.keys returns true when one key is missing',
  },
  {
    fn: () => not.keys(['a', 'b'])({ a: 1, b: 2, c: 3 }),
    expect: false,
    info: 'not.keys returns false when all keys exist',
  },
  {
    fn: () => not.keys([])({ a: 1 }),
    expect: false,
    info: 'not.keys returns false for empty key array (base always true for objects)',
  },
  {
    fn: () => not.keys(['a'])(null),
    expect: true,
    info: 'not.keys returns true when result is null',
  },

  // has.not.includes tests
  {
    fn: () => not.includes('d')(['a', 'b', 'c']),
    expect: true,
    info: 'not.includes returns true for array without item',
  },
  {
    fn: () => not.includes('a')(['a', 'b', 'c']),
    expect: false,
    info: 'not.includes returns false for array with item',
  },
  {
    fn: () => not.includes({ c: 3 })([{ a: 1 }, { b: 2 }]),
    expect: true,
    info: 'not.includes returns true when object is not in array',
  },
  {
    fn: () => not.includes({ a: 1 })([{ a: 1 }, { b: 2 }]),
    expect: false,
    info: 'not.includes returns false when object is in array',
  },
  {
    fn: () => not.includes('xyz')('hello world'),
    expect: true,
    info: 'not.includes returns true for string not containing substring',
  },
  {
    fn: () => not.includes('ello')('hello world'),
    expect: false,
    info: 'not.includes returns false for string containing substring',
  },
  {
    fn: () => not.includes('a')(123),
    expect: true,
    info: 'not.includes returns true for non-array/string number',
  },
  {
    fn: () => not.includes('a')(null),
    expect: true,
    info: 'not.includes returns true for null',
  },
  {
    fn: () => not.includes('a', 'b')(['a', 'b', 'c']),
    expect: false,
    info: 'not.includes returns false when all items are present',
  },
  {
    fn: () => not.includes('a', 'd')(['a', 'b', 'c']),
    expect: true,
    info: 'not.includes returns true when one item is missing',
  },
  {
    fn: () => not.includes((v: unknown) => is.number(v) && v > 5)([1, 3, 4]),
    expect: true,
    info: 'not.includes predicate returns true when no element matches',
  },
  {
    fn: () => not.includes((v: unknown) => is.number(v) && v > 5)([1, 3, 7]),
    expect: false,
    info: 'not.includes predicate returns false when element matches',
  },

  // has.not.oneOf tests
  {
    fn: () => not.oneOf(['a', 'b', 'c'])('d'),
    expect: true,
    info: 'not.oneOf returns true when value is not in options',
  },
  {
    fn: () => not.oneOf(['a', 'b', 'c'])('b'),
    expect: false,
    info: 'not.oneOf returns false when value is in options',
  },
  {
    fn: () => not.oneOf([1, 2, 3])(4),
    expect: true,
    info: 'not.oneOf works with numbers',
  },
  {
    fn: () => not.oneOf([{ a: 1 }, { b: 2 }])({ c: 3 }),
    expect: true,
    info: 'not.oneOf returns true for object not in options',
  },
  {
    fn: () => not.oneOf([{ a: 1 }, { b: 2 }])({ a: 1 }),
    expect: false,
    info: 'not.oneOf returns false for object in options',
  },
  {
    fn: () => not.oneOf([])(null),
    expect: true,
    info: 'not.oneOf returns true for empty options',
  },
  {
    fn: () => not.oneOf('a', 'b', 'c')('d'),
    expect: true,
    info: 'not.oneOf multi-arg returns true when value not in options',
  },
  {
    fn: () => not.oneOf('a', 'b', 'c')('b'),
    expect: false,
    info: 'not.oneOf multi-arg returns false when value in options',
  },
  {
    fn: () => not.oneOf()(null),
    expect: true,
    info: 'not.oneOf returns true with no options',
  },

  // has.not.matches tests
  {
    fn: () => not.matches(/^\d{3}-\d{4}$/)('123-45678'),
    expect: true,
    info: 'not.matches returns true for non-matching regex',
  },
  {
    fn: () => not.matches(/^\d{3}-\d{4}$/)('123-4567'),
    expect: false,
    info: 'not.matches returns false for matching regex',
  },
  {
    fn: () => not.matches(/hello/)('goodbye'),
    expect: true,
    info: 'not.matches returns true when pattern not found',
  },
  {
    fn: () => not.matches(/hello/)('hello world'),
    expect: false,
    info: 'not.matches returns false when pattern found',
  },
  {
    fn: () => not.matches(/test/)(123),
    expect: true,
    info: 'not.matches returns true for non-string',
  },
  {
    fn: () => not.matches(/test/)(null),
    expect: true,
    info: 'not.matches returns true for null',
  },
] satisfies TestCase[]
