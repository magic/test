export const View = () => [
  h1({ id: 'getting-started' }, 'Getting Started'),

  p('Be in a nodejs project.'),

  h2({}, 'Install'),

  Pre({ lines: 'false' }, 'npm i --save-dev --save-exact @magic/test'),

  h2({}, 'Create a Test File'),

  p([
    'Create a test file in the ',
    'test/',
    ' directory. The filename is used in test output, and the path should mirror your source structure:',
  ]),

  Pre(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
  { fn: () => 1 + 1, expect: 2, info: 'basic math' },
]
`),

  p(['Note: the test function is called automatically. ', 'expect: true ', 'is optional.']),

  h2({}, 'Add npm Scripts'),

  p('Add test scripts to your package.json:'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),

  p([
    't -p ',
    'runs tests in production mode (no coverage, faster). ',
    't',
    ' runs with coverage.',
  ]),

  h2({}, 'Run Tests'),

  Pre(`
npm test
`),

  h2({}, 'Example Output'),

  Pre(`
### Testing package: @magic/test
Ran 2 tests. Passed 2/2 100%
`),

  p('Faster output from a bigger project:'),

  Pre(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),

  h2({ id: 'next-steps' }, 'Next Steps'),

  ul([
    li([
      Link({ to: '/writing-tests/' }, 'Writing Tests'),
      ' - hooks, promises, types, multiple tests',
    ]),
    li([
      Link({ to: '/lib/' }, 'Utility Functions'),
      ' - deep, fs, curry, log, vals, env, http, mock, has',
    ]),
    li([Link({ to: '/svelte/' }, 'Svelte Testing'), ' - mount components, interact, assert']),
    li([Link({ to: '/cli/' }, 'CLI & Usage'), ' - flags, sharding, performance tips']),
    li([
      Link({ to: '/test-isolation/' }, 'Test Isolation'),
      ' - prevent state leakage between tests',
    ]),
    li([Link({ to: '/error-codes/' }, 'Error Codes'), ' - programmatic error handling']),
  ]),
]
