export const View = () => [
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
    ' add the __isolate export at the top of your test file:',
  ]),

  Pre(`
export const __isolate = true

export default [
  { fn: () => (global.test = 1), expect: 1 },
  { fn: () => global.test === undefined, expect: true, info: 'fresh global state' },
]
`),

  p(['each test starts with fresh globals.']),

  h2({}, 'Programmatic Detection'),

  p(['suiteNeedsIsolation(tests) tells you if a suite requires isolation:']),

  Pre(`
import { suiteNeedsIsolation } from '@magic/test'

const needsIsolation = suiteNeedsIsolation(tests)
`),

  p(['for custom runners / test tooling.']),
]
