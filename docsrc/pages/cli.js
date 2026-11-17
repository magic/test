export const View = () => [
  h1({ id: 'cli' }, 'CLI & Usage'),

  h2({ id: 'cli-packagejson' }, 'package.json (recommended)'),

  p('Add the magic/test bin scripts to package.json:'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t",
  },
  "devDependencies": {
    "@magic/test": "github:magic/test"
  }
}
`),

  p('Then use the npm run scripts:'),

  Pre(`
npm test
npm run coverage
`),

  h2({ id: 'cli-global' }, 'Globally (not recommended)'),

  p([
    'You can install this library globally,',
    ' but adding the dependency and scripts to package.json is better.',
  ]),

  p(['everyone sees the dependency,', ' and your shell stays free of clutter.']),

  Pre(`
npm i -g @magic/test

// run tests in production mode
t -p

// run tests and get coverage in verbose mode
t
`),

  h2({ id: 'cli-flags' }, 'CLI Flags'),

  p('Available command-line flags:'),

  ul([
    li('-p, --production, --prod - Run tests without coverage (faster)'),
    li('-l, --verbose, --loud - Show detailed output including passing tests'),
    li('-i, --include - Files to include in coverage'),
    li('-e, --exclude - Files to exclude from coverage'),
    li('--shards N - Total number of shards to split tests across'),
    li('--shard-id N - Shard ID (0-indexed) to run'),
    li('-w, --workers N - Max parallel workers (default: auto)'),
    li('-s, --slow, --timing - Show the slowest tests'),
    li('--nice N - CPU nice value for the test process (default 10, 0 disables)'),
    li('--native - Use the native node --test runner (with coverage)'),
    li('--help - Show help text'),
  ]),

  p(['Use --shards and --shard-id together.', ' --shard-id is 0-indexed (0 to N-1).']),

  h2({ id: 'sharding' }, 'Sharding Tests'),

  p('Run tests in parallel across multiple processes to speed up large test suites:'),

  Pre(`
# Run 4 shards, this is shard 0 (of 0-3)
t --shards 4 --shard-id 0

# Run shard 1
t --shards 4 --shard-id 1

# Combine with other flags
t -p --shards 4 --shard-id 2
`),

  p([
    'Tests are distributed with a hash of the test file path:',
    ' same file, same shard, every run.',
  ]),

  p('Add to your package.json for CI/CD:'),

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

  p('Or use a single command to run all shards in parallel:'),

  Pre(`
# Run all 4 shards in parallel and wait for all to complete
npm run test:shard:0 & npm run test:shard:1 & npm run test:shard:2 & npm run test:shard:3 & wait
`),

  h2({ id: 'exit-codes' }, 'Exit Codes'),

  p('exit codes:'),

  p('| Exit Code | Meaning |'),
  p('| --------- | ------- |'),
  p('| 0 | All tests passed |'),
  p('| 1 | One or more tests failed |'),

  Pre(`
# Run tests and check exit code
npm test
echo "Exit code: $?"  # 0 = success, 1 = failure
`),

  h2({ id: 'verbose-output' }, 'Verbose Output'),

  p('The -l (or --verbose, --loud) flag enables detailed output:'),

  Pre(`
# Shows all tests including passing ones
t -l
`),

  p('What verbose mode shows:'),

  ul([
    li('All test results (not just failures)'),
    li('Individual test execution time'),
    li('Full test names with suite hierarchy'),
    li('Detailed error messages with stack traces'),
  ]),

  p('Default mode (without -l):'),

  ul([
    li('Only shows failing tests'),
    li('Shows summary only for passing suites'),
    li('Faster output for large test suites'),
  ]),

  p('Example output without -l:'),

  Pre(`
### Testing package: my-lib
/addition.js => Pass: 3/3 100%
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),

  p('Example output with -l:'),

  Pre(`
### Testing package: my-lib
* pass: got 3 expected 3
* pass: got "hello" expected "hello"
--- /addition.js, Pass: 3/3 100% 2ms
/addition.js => Pass: 3/3 100%
--- /multiplication.js, Pass: 4/4 100% 3ms
/multiplication.js => Pass: 4/4 100%
Ran 7 tests in 12ms. Passed 7/7 100%
`),

  h2({}, '.d.ts type tests'),

  p([
    'every run also type-checks the .d.ts files of your project (the __dts__ suites in the output).',
    ' They read types from the tsconfig.json of the tested repository.',
    ' -e / --exclude applies to them too, and MAGIC_TEST_SKIP_DTS_TESTS=1 skips them.',
  ]),

  h2({ id: 'performance-tips' }, 'Performance Tips'),

  p(['see the ', Link({ to: '/cli/performance-tips/' }, 'Performance Tips'), ' page.']),

  h3({}, 'Quick Reference'),

  Pre(`
# Fast mode - no coverage
t -p

# Shard across 4 processes
t --shards 4 --shard-id 0
`),

  h2({ id: 'common-pitfalls' }, 'Common Pitfalls'),

  p(['see the ', Link({ to: '/cli/common-pitfalls/' }, 'Common Pitfalls'), ' page.']),

  h3({}, 'Quick Reference'),

  p('Avoid these common mistakes:'),

  ul([
    li('Forgetting to return in async tests'),
    li('Not wrapping callback functions'),
    li('Mutating shared state between tests'),
    li('Using the wrong equality check'),
    li('Not awaiting async operations'),
    li('Incorrect hook usage'),
  ]),
]
