import { suiteHasBeforeAllOrAfterAll } from '../../../src/run/lib/suiteHasBeforeAllOrAfterAll.js'
import type { TestCase } from '../../../src/types.js'

export default [
  {
    fn: () => suiteHasBeforeAllOrAfterAll([]),
    expect: false,
    info: 'returns false for empty array',
  },
  {
    fn: () => suiteHasBeforeAllOrAfterAll({}),
    expect: false,
    info: 'returns false for empty object',
  },
  {
    fn: () => suiteHasBeforeAllOrAfterAll({ beforeAll: () => {} }),
    expect: true,
    info: 'returns true for object with beforeAll',
  },
  {
    fn: () => suiteHasBeforeAllOrAfterAll({ afterAll: () => {} }),
    expect: true,
    info: 'returns true for object with afterAll',
  },
  {
    fn: () =>
      suiteHasBeforeAllOrAfterAll({
        beforeAll: () => {},
        afterAll: () => {},
      }),
    expect: true,
    info: 'returns true for object with both hooks',
  },
  {
    fn: () =>
      suiteHasBeforeAllOrAfterAll({
        beforeAll: undefined,
      }),
    expect: false,
    info: 'returns false for non-function beforeAll',
  },
  {
    fn: () =>
      suiteHasBeforeAllOrAfterAll({
        afterAll: undefined,
      }),
    expect: false,
    info: 'returns false for non-function afterAll',
  },
  {
    fn: () => suiteHasBeforeAllOrAfterAll([{ fn: () => {} }]),
    expect: false,
    info: 'returns false for array',
  },
] satisfies TestCase[]
