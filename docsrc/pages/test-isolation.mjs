export const View = state => [
  h1({ id: 'test-isolation' }, 'Test Isolation'),

  p([
    '@magic/test supports test isolation to prevent tests from affecting each other.',
    ' Tests in the same suite can share state, but you can isolate them:',
  ]),

  Pre(`
export default [
  // This test runs in isolation from others
  {
    fn: () => {
      const state = { counter: 0 }
      state.counter++
      return state.counter
    },
    expect: 1,
    info: 'isolated test with local state',
  },
]
`),

  h2({ id: 'isolate' }, '__isolate'),

  p('Global Isolation Mode:'),

  p([
    'By default, tests in the same file share global state.',
    ' To enable strict isolation where each test gets a fresh environment,',
    ' set `export const __isolate = true` at the top of your test file.',
  ]),

  Pre(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),

  p([
    'This ensures each test runs with a fresh global environment,',
    ' preventing state leakage between tests.',
  ]),

  h2({}, 'Programmatic Detection'),

  p([
    'You can programmatically check if a suite requires isolation',
    ' using the `suiteNeedsIsolation` utility:',
  ]),

  Pre(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),

  p('This is useful for custom runners or when building test tooling.'),
]
