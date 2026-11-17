export const View = () => [
  h1({ id: 'performance-tips' }, 'Performance Tips'),

  p('make runs faster:'),

  h2({}, 'Use the -p Flag'),

  p(['Run tests in production mode to skip coverage and get faster output:']),

  Pre(`
# fast mode - no coverage, only shows failures
t -p
# or via the recommended npm script
npm test
`),

  h2({}, 'Shard Large Test Suites'),

  p(['Split tests across multiple processes to speed up large suites:']),

  Pre(`
# Split tests across 4 processes
t --shards 4 --shard-id 0
`),

  p(['tests are distributed with a hash of the file path — same file, same shard.']),

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

  p([
    'Control max parallel workers with the',
    ' --workers ',
    'flag. The auto default spawns max(1, min(CPUs - 2, 4)) workers,',
    ' and throttles itself on a busy machine (MAGIC_TEST_ADAPTIVE=0 or CI disables it):',
  ]),

  Pre(`
# use 2 workers
t -p --workers 2
`),

  h2({}, 'Be nice'),

  p([
    'on a busy machine the run is wrapped in nice (default 10)',
    ' so your own work stays responsive. --nice 0 disables it:',
  ]),

  Pre(`
t --nice 5
t --nice 0
`),

  h2({}, 'Compile cache'),

  p([
    'svelte and ts compilation is cached persistently between runs.',
    ' Set MAGIC_TEST_COMPILE_CACHE=0 to restore the old always-recompile behavior:',
  ]),

  Pre(`
MAGIC_TEST_COMPILE_CACHE=0 t -p
`),

  p(['see ', Link({ to: '/cli/' }, 'CLI & Usage'), ' for the full flag reference.']),
]
