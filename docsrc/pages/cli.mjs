export const View = state => [
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
    ' but the recommendation is to add the dependency and scripts to the package.json file.',
  ]),

  p([
    'This both explains to everyone that your app has these dependencies',
    ' as well as keeping your bash free of clutter.',
  ]),

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
    li('--help - Show help text'),
  ]),

  p([
    'Note: `--shards` and `--shard-id` must be used together.',
    ' `--shard-id` is 0-indexed (0 to N-1).',
  ]),

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
    'Tests are distributed deterministically using a hash of the test file path,',
    ' ensuring each test always runs in the same shard.',
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

  p('@magic/test returns specific exit codes to indicate test results:'),

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
▶ addition
  ✔ adds two positive numbers (1.2ms)
  ✔ handles zero correctly (0.8ms)
  ✔ handles negative numbers (0.9ms)
▶ multiplication
  ✔ multiplies by zero (0.7ms)
  ✔ multiplies by one (0.6ms)
  ✔ multiplies two positives (0.8ms)
  ✔ handles negative numbers (0.9ms)
Ran 7 tests in 12ms. Passed 7/7 100%
`),

  h2({ id: 'performance-tips' }, 'Performance Tips'),

  p('Follow these tips to get the most out of @magic/test:'),

  h3({}, 'Use the -p flag for development'),

  Pre(`
# Fast mode - no coverage, only shows failures
npm test
# or
t -p
`),

  h3({}, 'Shard large test suites'),

  Pre(`
# Split tests across multiple processes
t --shards 4 --shard-id 0
`),

  h3({}, 'Minimize async overhead'),

  Pre(`
# Slower: unnecessary async
export default {
  fn: async () => {
    return true
  },
  expect: true,
}

# Faster: sync test
export default {
  fn: () => true,
  expect: true,
}
`),

  h3({}, 'Use local state instead of globals'),

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

  h3({}, 'Batch related tests'),

  Pre(`
# Faster: single suite with multiple tests
export default [
  { fn: () => add(1, 2), expect: 3 },
  { fn: () => add(0, 0), expect: 0 },
  { fn: () => add(-1, 1), expect: 0 },
]
`),

  h2({ id: 'common-pitfalls' }, 'Common Pitfalls'),

  p('Avoid these common mistakes when writing tests:'),

  h3({}, '1. Forgetting to return in async tests'),

  Pre(`
# Wrong: promise resolves before test checks result
export default {
  fn: async () => {
    const result = await someAsyncFunction()
    // missing return!
  },
  expect: true,
}

# Correct:
export default {
  fn: async () => {
    return await someAsyncFunction()
  },
  expect: true,
}
`),

  h3({}, '2. Not wrapping callback functions'),

  Pre(`
# Wrong: function gets called immediately
export default {
  fn: doSomething(),  // executes immediately!
  expect: true,
}

# Correct: wrap in function to defer execution
export default {
  fn: () => doSomething(),
  expect: true,
}
`),

  h3({}, '3. Mutating shared state between tests'),

  Pre(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, // fails! counter is now 1
]

# Correct: use local state or reset in beforeEach
let counter = 0
const beforeEach = () => { counter = 0 }
export default {
  beforeEach,
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
`),

  h3({}, '4. Using the wrong equality check'),

  Pre(`
# Wrong: checks reference equality
export default {
  fn: () => [1, 2, 3],
  expect: [1, 2, 3], // fails! different arrays
}

# Correct: use @magic/types for deep comparison
import { is } from '@magic/test'
export default {
  fn: () => [1, 2, 3],
  expect: is.deep.equal([1, 2, 3]),
}
`),

  h3({}, '5. Not awaiting async operations'),

  Pre(`
# Wrong: test finishes before promise resolves
export default {
  fn: () => {
    setTimeout(() => {
      // This never gets checked!
    }, 100)
  },
  expect: true,
}

# Correct: return the promise
export default {
  fn: () => new Promise(resolve => {
    setTimeout(() => resolve(true), 100)
  }),
  expect: true,
}

# Or use the promise helper:
import { promise } from '@magic/test'
export default {
  fn: promise(cb => setTimeout(() => cb(null, true), 100)),
  expect: true,
}
`),

  h3({}, '6. Incorrect hook usage'),

  Pre(`
# Wrong: before/after hooks on individual tests, not suites
export default [
  {
    fn: () => true,
    beforeAll: () => {}, // wrong! beforeAll is for suites
    afterAll: () => {},
    expect: true,
  },
]

# Correct: hooks at suite level
const beforeAll = () => {}
const afterAll = () => {}
export default {
  beforeAll,
  afterAll,
  tests: [
    { fn: () => true, expect: true },
  ],
}
`),
]
