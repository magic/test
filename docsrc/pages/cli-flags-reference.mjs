export const View = () => [
  h1({ id: 'cli-flags-reference' }, 'CLI Flags Reference'),

  p('Available command-line flags for @magic/test:'),

  h2({}, 'Flag Reference Table'),

  Pre(
    '| Flag | Aliases | Default | Env Var | Description | Example |\n| :--- | :----- | :-----: | :------ | :---------- | :------ |\n| -p, --production, --prod |  |  |  | Run tests without coverage (faster) | t -p |\n| -l, --verbose, --loud |  |  |  | Show detailed output including passing tests | t -l |\n| -i, --include |  |  |  | Files to include in coverage | t -i "src/*.js" |\n| -e, --exclude |  |  |  | Files to exclude from coverage | t -e "src/test.js" |\n| --shards N |  |  |  | Total number of shards to split tests across | t --shards 4 --shard-id 0 |\n| --shard-id N |  |  |  | Shard ID (0-indexed) to run | t --shards 4 --shard-id 2 |\n| -w, --workers N |  | auto |  | Max parallel workers (default: auto-detect CPU count) | t -p --workers 2 |\n| --help |  |  |  | Show help text | t --help |\n| --trace |  |  | MAGIC_TEST_TRACE | Enable timing traces for performance debugging | t --trace |',
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
npm test  # runs with coverage

npm test  # runs without coverage (faster)
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
    li([Link({ to: '/performance-tips/' }, 'Performance Tips'), ' - optimization techniques']),
    li([Link({ to: '/cli-sharding-cheatsheet/' }, 'CLI Sharding Cheat-Sheet'), ' - CI/CD examples']),
  ]),
]
