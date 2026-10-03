import {
  hasBeforeAll,
  hasAfterAll,
  hasBeforeEach,
  hasAfterEach,
} from '#src/run/lib/suiteHooks.js'

export default [
  // hasBeforeAll
  {
    fn: () => {
      const t = { beforeAll: () => {} }
      return hasBeforeAll(t) === true
    },
    expect: true,
    info: 'hasBeforeAll returns true when beforeAll is a function',
  },
  {
    fn: () => {
      const t = { beforeAll: 'not a function' }
      return hasBeforeAll(t) === false
    },
    expect: true,
    info: 'hasBeforeAll returns false when beforeAll is not a function',
  },
  {
    fn: () => {
      const t = {}
      return hasBeforeAll(t) === false
    },
    expect: true,
    info: 'hasBeforeAll returns false when beforeAll key missing',
  },
  {
    fn: () => {
      return hasBeforeAll(null) === false
    },
    expect: true,
    info: 'hasBeforeAll returns false for null',
  },
  {
    fn: () => {
      return hasBeforeAll(undefined) === false
    },
    expect: true,
    info: 'hasBeforeAll returns false for undefined',
  },
  {
    fn: () => {
      return hasBeforeAll(42) === false
    },
    expect: true,
    info: 'hasBeforeAll returns false for primitives',
  },
  // hasAfterAll
  {
    fn: () => {
      const t = { afterAll: () => {} }
      return hasAfterAll(t) === true
    },
    expect: true,
    info: 'hasAfterAll returns true when afterAll is a function',
  },
  {
    fn: () => {
      const t = { afterAll: 42 }
      return hasAfterAll(t) === false
    },
    expect: true,
    info: 'hasAfterAll returns false when afterAll is not a function',
  },
  {
    fn: () => {
      return hasAfterAll(null) === false
    },
    expect: true,
    info: 'hasAfterAll returns false for null',
  },
  // hasBeforeEach
  {
    fn: () => {
      const t = { beforeEach: () => {} }
      return hasBeforeEach(t) === true
    },
    expect: true,
    info: 'hasBeforeEach returns true when beforeEach is a function',
  },
  {
    fn: () => {
      const t = {}
      return hasBeforeEach(t) === false
    },
    expect: true,
    info: 'hasBeforeEach returns false when beforeEach missing',
  },
  {
    fn: () => {
      return hasBeforeEach(undefined) === false
    },
    expect: true,
    info: 'hasBeforeEach returns false for undefined',
  },
  // hasAfterEach
  {
    fn: () => {
      const t = { afterEach: () => {} }
      return hasAfterEach(t) === true
    },
    expect: true,
    info: 'hasAfterEach returns true when afterEach is a function',
  },
  {
    fn: () => {
      const t = {}
      return hasAfterEach(t) === false
    },
    expect: true,
    info: 'hasAfterEach returns false when afterEach missing',
  },
  {
    fn: () => {
      return hasAfterEach(null) === false
    },
    expect: true,
    info: 'hasAfterEach returns false for null',
  },
  // All false together
  {
    fn: () => {
      return (
        hasBeforeAll({}) === false &&
        hasAfterAll({}) === false &&
        hasBeforeEach({}) === false &&
        hasAfterEach({}) === false
      )
    },
    expect: true,
    info: 'all predicates return false for bare object',
  },
]
