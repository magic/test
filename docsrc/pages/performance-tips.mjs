export const View = () => [
  h1({ id: 'performance-tips' }, 'Performance Tips'),

  p('Follow these tips to get the most out of @magic/test:'),

  h2({}, 'Use the -p Flag'),

  p(['Run tests in production mode to skip coverage and get faster output:']),

  Pre(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),

  h2({}, 'Shard Large Test Suites'),

  p(['Split tests across multiple processes to speed up large suites:']),

  Pre(`
# Split tests across 4 processes
t --shards 4 --shard-id 0
`),

  p(['Tests are distributed deterministically using a hash of the test file path.']),

  h2({}, 'Minimize Async Overhead'),

  p(['Async tests are slower than sync tests. Use sync where possible:']),

  Pre(`
# Slower: unnecessary async
export default {
  fn: async () => true,
  expect: true,
}

# Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
`),

  h2({}, 'Use Local State Instead of Globals'),

  p(['Global state requires isolation overhead. Local state is naturally isolated:']),

  Pre(`
# Slower: global state requires isolation
export const __isolate = true

# Faster: local state is naturally isolated
export default [
  {
    fn: () => {
      const counter = 0
      return ++counter
    },
    expect: 1,
  },
]
`),

  h2({}, 'Batch Related Tests'),

  p(['Single suite with multiple tests is faster than multiple suites:']),

  Pre(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),

  h2({}, 'Worker Concurrency'),

  p([
    'Control max parallel workers with the',
    ' --workers ',
    'flag. Default is auto-detect CPU count:',
  ]),

  Pre(`
# Use 2 workers
t -p --workers 2
`),

  p(['Link: ', Link({ to: '/cli/' }, 'CLI & Usage'), ' for full flag reference.']),
]
