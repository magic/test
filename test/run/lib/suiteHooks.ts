import { hasBeforeAll, hasAfterAll, hasBeforeEach, hasAfterEach } from '#src/run/lib/suiteHooks.js'

export default [
  // hasBeforeAll
  {
    fn: () => {
      const t = { beforeAll: () => {} }
      return hasBeforeAll(t)
    },
    expect: true,
    info: 'hasBeforeAll returns true when beforeAll is a function',
  },
  {
    fn: () => {
      const t = { beforeAll: 'not a function' }
      return hasBeforeAll(t)
    },
    expect: false,
    info: 'hasBeforeAll returns false when beforeAll is not a function',
  },
  {
    fn: () => {
      const t = {}
      return hasBeforeAll(t)
    },
    expect: false,
    info: 'hasBeforeAll returns false when beforeAll key missing',
  },
  {
    fn: () => hasBeforeAll(null),
    expect: false,
    info: 'hasBeforeAll returns false for null',
  },
  {
    fn: () => hasBeforeAll(undefined),
    expect: false,
    info: 'hasBeforeAll returns false for undefined',
  },
  {
    fn: () => hasBeforeAll(42),
    expect: false,
    info: 'hasBeforeAll returns false for primitives',
  },
  // hasAfterAll
  {
    fn: () => {
      const t = { afterAll: () => {} }
      return hasAfterAll(t)
    },
    expect: true,
    info: 'hasAfterAll returns true when afterAll is a function',
  },
  {
    fn: () => {
      const t = { afterAll: 42 }
      return hasAfterAll(t)
    },
    expect: false,
    info: 'hasAfterAll returns false when afterAll is not a function',
  },
  {
    fn: () => hasAfterAll(null),
    expect: false,
    info: 'hasAfterAll returns false for null',
  },
  // hasBeforeEach
  {
    fn: () => {
      const t = { beforeEach: () => {} }
      return hasBeforeEach(t)
    },
    expect: true,
    info: 'hasBeforeEach returns true when beforeEach is a function',
  },
  {
    fn: () => {
      const t = {}
      return hasBeforeEach(t)
    },
    expect: false,
    info: 'hasBeforeEach returns false when beforeEach missing',
  },
  {
    fn: () => hasBeforeEach(undefined),
    expect: false,
    info: 'hasBeforeEach returns false for undefined',
  },
  // hasAfterEach
  {
    fn: () => {
      const t = { afterEach: () => {} }
      return hasAfterEach(t)
    },
    expect: true,
    info: 'hasAfterEach returns true when afterEach is a function',
  },
  {
    fn: () => {
      const t = {}
      return hasAfterEach(t)
    },
    expect: false,
    info: 'hasAfterEach returns false when afterEach missing',
  },
  {
    fn: () => hasAfterEach(null),
    expect: false,
    info: 'hasAfterEach returns false for null',
  },
  // All false together
  {
    fn: () => [hasBeforeAll({}), hasAfterAll({}), hasBeforeEach({}), hasAfterEach({})],
    expect: [false, false, false, false],
    info: 'all predicates return false for bare object',
  },
]
