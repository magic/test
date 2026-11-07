export const View = () => [
  h1({ id: 'common-pitfalls' }, 'Common Pitfalls'),

  p('Avoid these common mistakes when writing tests:'),

  h2({}, '1. Forgetting to Return in Async Tests'),

  p(['The test finishes before the promise resolves. Always return the promise:']),

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

  h2({}, '2. Not Wrapping Callback Functions'),

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

  h2({}, '3. Mutating Shared State Between Tests'),

  Pre(`
# Wrong: counter persists between tests
let counter = 0
export default [
  { fn: () => ++counter, expect: 1 },
  { fn: () => ++counter, expect: 2 }, // fails! counter is now 1
]

# Correct: use beforeEach to reset state
export default {
  beforeEach: () => { counter = 0 },
  tests: [
    { fn: () => ++counter, expect: 1 },
    { fn: () => ++counter, expect: 1 }, // passes - reset before each
  ],
}
`),

  h2({}, '4. Using the Wrong Equality Check'),

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

  h2({}, '5. Not Awaiting Async Operations'),

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

  h2({}, '6. Incorrect Hook Usage'),

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
export default {
  beforeAll: () => {},
  afterAll: () => {},
  tests: [
    { fn: () => true, expect: true },
  ],
}
`),
]
