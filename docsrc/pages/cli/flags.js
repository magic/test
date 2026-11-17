export const View = () => [
  h1({ id: 'cli-flags-reference' }, 'CLI Flags Reference'),

  p('Available command-line flags for @magic/test:'),

  h2({}, 'Flag Reference Table'),

  Pre(
    '| Flag | Aliases | Default | Env Var | Description | Example |\n| :--- | :----- | :-----: | :------ | :---------- | :------ |\n| -p, --production, --prod |  |  |  | Run tests without coverage (faster) | t -p |\n| -l, --verbose, --loud |  |  |  | Show detailed output including passing tests | t -l |\n| -i, --include |  |  |  | Files to include in coverage | t -i "src/*.js" |\n| -e, --exclude |  |  |  | Files to exclude from coverage and .d.ts type tests | t -e "src/test.js" |\n| --shards N |  |  |  | Total number of shards to split tests across | t --shards 4 --shard-id 0 |\n| --shard-id N |  |  |  | Shard ID (0-indexed) to run | t --shards 4 --shard-id 2 |\n| -s, --slow, --timing |  |  | MAGIC_TEST_TIMING | Show the slowest tests | t -s |\n| --error-length N |  | 70 | MAGIC_TEST_ERROR_LENGTH | Max length for error strings (0 = no limit) | t --error-length 0 |\n| --timeout N | -t, --to | 30000 | MAGIC_TEST_TIMEOUT | Test timeout in ms | t --timeout 60000 |\n| -w, --workers N |  | auto | MAGIC_TEST_WORKERS | Max parallel workers (auto: capped at 4, load-adaptive) | t -p --workers 2 |\n| --nice N |  | 10 | MAGIC_TEST_NICE | CPU nice value 0-19 for the test process (0 disables) | t --nice 5 |\n| --native |  |  |  | Run with the native node --test runner (with coverage) | t --native |\n| --help |  |  |  | Show help text | t --help |',
  ),

  h2({}, 'Flag Notes'),

  ul([
    li('--shards and --shard-id must be used together'),
    li('--shard-id is 0-indexed (0 to N-1)'),
    li('Use -p flag for faster development runs (no coverage)'),
    li('--workers controls parallel test execution'),
  ]),

  h2({}, 'Example Usage'),

  h3({}, 'Basic Test Run'),

  Pre(`
npm run coverage  # runs with coverage

npm test  # t -p, no coverage (faster)
`),

  h3({}, 'Shard Large Test Suite'),

  Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2 --workers 2
`),

  h2({}, 'See Also'),

  ul([
    li([Link({ to: '/cli/' }, 'CLI & Usage'), ' - detailed usage guide']),
    li([Link({ to: '/cli/performance-tips/' }, 'Performance Tips'), ' - optimization techniques']),
    li([
      Link({ to: '/cli/sharding-cheatsheet/' }, 'CLI Sharding Cheat-Sheet'),
      ' - CI/CD examples',
    ]),
  ]),
]
