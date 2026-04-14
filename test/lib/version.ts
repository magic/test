import type { Test } from '../../src/types.js'
import { version } from '../../src/lib/version.js'
import is from '@magic/types'

const lib = {
  array: [],
  boolean: true,
  number: 1,
  string: '',
  object: {},
  function: () => {},
  undefined: undefined,
  null: null,
  bigint: 1n,
  symbol: Symbol('test'),
}

const spec = {
  array: 'array',
  boolean: 'boolean',
  number: 'number',
  string: 'string',
  object: 'object',
  function: 'function',
  undefined: 'undefined',
  null: 'null',
  bigint: 'bigint',
  symbol: 'symbol',
}

export default [
  {
    fn: () => version(lib, spec, 'lib'),
    expect: (results: Test[]) => results.some(result => result.fn === true),
    info: 'should test all basic types correctly',
  },
  {
    fn: () => {
      const nestedLib = {
        parent: {
          child: {
            array: [],
            number: 1,
          },
        },
      }
      const nestedSpec = {
        parent: {
          child: {
            array: 'array',
            number: 'number',
          },
        },
      }
      return version(nestedLib, nestedSpec, 'nestedLib')
    },
    expect: (results: Test[]) => is.arr(results),
    info: 'should handle nested objects',
  },
  {
    fn: () => {
      const arrayLib = {
        parent: [
          'object',
          {
            child: 'string',
          },
        ],
      }
      const arraySpec = {
        parent: [
          'object',
          {
            child: 'string',
          },
        ],
      }
      return version(arrayLib, arraySpec, 'arrayLib')
    },
    expect: (results: Test[]) => results.some(result => result.fn === true),
    info: 'should handle array specifications',
  },
  {
    fn: () => version(lib, {}, 'lib'),
    expect: (results: Test[]) =>
      results.every(result => !result.fn && result.info?.includes('Spec missing')),
    info: 'should handle missing specs',
  },
  {
    fn: () => version(lib, { array: 'nonexistent' }, 'lib'),
    expect: (results: Test[]) =>
      results.some(result => !result.fn && result.info?.includes('does not have this function')),
    info: 'should handle wrong specs',
  },
  {
    fn: () => version(lib, { object: 'object' }, 'lib'),
    expect: (results: Test[]) =>
      results.some(
        result => !result.fn && result.info?.includes('specifies object, but no children defined'),
      ),
    info: 'should handle object spec without children',
  },
  {
    fn: () => {
      const functionLib = {
        fn: () => 42,
      }
      const functionSpec = {
        fn: () => true,
      }
      return version(functionLib, functionSpec, 'functionLib')
    },
    expect: (results: Test[]) => results.every(result => result.fn === true),
    info: 'should handle function specs',
  },
  {
    fn: () => {
      const libWithFalse = {
        parent: ['object', false],
      }
      const specWithFalse = {
        parent: ['object', false],
      }
      return version(libWithFalse, specWithFalse, 'libWithFalse')
    },
    expect: (results: Test[]) => results.every(result => result.fn === true),
    info: 'should handle false spec for array',
  },
  {
    fn: () => {
      const arrayOfLibs = {
        0: { fn: () => 42 },
      }
      const arrayOfLibsSpec = {
        0: { fn: 'fn' },
      }

      return version(arrayOfLibs, arrayOfLibsSpec, 'arrayOfLibs')
    },
    expect: (results: Test[]) => results.every(result => result.fn === true),
    info: 'should handle function specs',
  },
]
