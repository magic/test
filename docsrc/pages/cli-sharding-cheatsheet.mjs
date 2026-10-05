export const View = () => [
  h1({ id: 'cli-sharding-cheatsheet' }, 'CLI Sharding Cheat-Sheet'),

  p('Run tests in parallel across multiple processes to speed up large test suites:'),

  h2({}, 'Basic Sharding Commands'),

  Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Run shard 2
t --shards 4 --shard-id 2

# Run shard 3
t --shards 4 --shard-id 3
`),

  p([
    'Tests are distributed deterministically using a hash of the test file path,',
    ' ensuring each test always runs in the same shard.',
  ]),

  h2({}, 'Combine with Other Flags'),

  Pre(`
# Run with production mode (no coverage)
t -p --shards 4 --shard-id 2

# Add verbose output
t -l --shards 4 --shard-id 1

# Custom worker count
t --shards 4 --shard-id 0 --workers 2
`),

  h2({}, 'Package.json for CI/CD'),

  p('Add these scripts to your package.json:'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "test:shard:0": "t -p --shards 4 --shard-id 0",
    "test:shard:1": "t -p --shards 4 --shard-id 1",
    "test:shard:2": "t -p --shards 4 --shard-id 2",
    "test:shard:3": "t -p --shards 4 --shard-id 3"
  }
}
`),

  h2({}, 'Run All Shards in Parallel'),

  p('Use a single command to run all shards in parallel:'),

  Pre(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),

  p('Or with production mode:'),

  Pre(`
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),

  h2({}, 'Deterministic Distribution'),

  p([
    'Test distribution is deterministic - the same test file will always run in the same shard.',
    ' This ensures consistent behavior across CI runs.',
  ]),

  h2({}, 'See Also'),

  ul([
    li([Link({ to: '/cli/' }, 'CLI & Usage'), ' - full CLI documentation']),
    li([Link({ to: '/cli-flags-reference/' }, 'CLI Flags Reference'), ' - detailed flag list']),
    li([Link({ to: '/performance-tips/' }, 'Performance Tips'), ' - optimization techniques']),
  ]),
]
