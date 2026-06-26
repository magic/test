export const View = state => [
  h1({ id: 'magictest' }, '@magic/test'),

  p([
    'Declaratively test your ecmascript module files.',
    ' No transpiling of either your codebase nor the tests.',
    ' Incredibly fast.',
  ]),

  GitBadges('@magic/test'),

  h2({ id: 'getting-started' }, 'Getting Started'),

  p('Be in a nodejs project.'),

  h3({}, 'Install'),

  Pre({ lines: 'false' }, 'npm i --save-dev --save-exact @magic/test'),

  h3({}, 'Create a test'),

  Pre(`
// test/yourFileToTest.js
export default [
  { fn: () => true, expect: true, info: 'true is true' },
]
`),

  h3({}, 'Add npm scripts'),

  Pre(`
{
  "scripts": {
    "test": "t -p",
    "coverage": "t"
  }
}
`),

  h3({}, 'Run tests'),

  Pre(`
npm test
`),

  p('Example output:'),

  Pre(`
### Testing package: @magic/test
Ran 2 tests. Passed 2/2 100%
`),

  p('Faster output from a bigger project:'),

  Pre(`
### Testing package: @artificialmuseum/engine
Ran 90307 tests in 274.5ms. Passed 90307/90307 100%
`),

  h2({ id: 'features' }, 'Features'),

  ul([
    li([Link({ to: '/writing-tests/' }, 'Write tests'), ' in plain JavaScript or TypeScript']),
    li([Link({ to: '/lib/' }, 'Utility functions'), ' for deep equality, mocking, HTTP, and more']),
    li([Link({ to: '/svelte/' }, 'Svelte 5'), ' component testing built-in']),
    li([Link({ to: '/cli/' }, 'CLI tools'), ' with sharding for parallel test execution']),
    li([Link({ to: '/test-isolation/' }, 'Test isolation'), ' for preventing state leakage']),
    li([Link({ to: '/error-codes/' }, 'Error codes'), ' for programmatic error handling']),
  ]),

  h2({ id: 'quick-examples' }, 'Quick Examples'),

  h3({}, 'Simple test'),

  Pre(`
export default [
  { fn: () => 1 + 1, expect: 2 },
  { fn: () => 'hello', expect: 'hello' },
]
`),

  h3({}, 'Async test'),

  Pre(`
import { promise } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 100)),
    expect: true,
    info: 'handle promises',
  },
]
`),

  h3({}, 'Deep equality'),

  Pre(`
import { is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: is.deep.equal({ a: 1, b: 2 }),
    info: 'deep compare objects',
  },
]
`),

  h3({}, 'Mock function'),

  Pre(`
import { mock } from '@magic/test'

export default [
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      return spy.calls.length === 1
    },
    expect: true,
    info: 'mock tracks calls',
  },
]
`),

  h2({ id: 'learn-more' }, 'Learn More'),

  ul([
    li(
      Link({ to: '/writing-tests/' }, 'Writing Tests'),
      ' - hooks, promises, types, multiple tests',
    ),
    li(
      Link({ to: '/lib/' }, 'Utility Functions'),
      ' - deep, fs, curry, log, vals, env, http, mock, has',
    ),
    li(Link({ to: '/svelte/' }, 'Svelte Testing'), ' - mount components, interact, assert'),
    li(Link({ to: '/cli/' }, 'CLI & Usage'), ' - flags, sharding, performance tips'),
    li(
      Link({ to: '/test-isolation/' }, 'Test Isolation'),
      ' - prevent state leakage between tests',
    ),
    li(Link({ to: '/error-codes/' }, 'Error Codes'), ' - programmatic error handling'),
    li(Link({ to: '/changelog/' }, 'Changelog'), ' - release history'),
  ]),

  p([
    'This library tests itself. Have a look at ',
    Link({ to: 'https://github.com/magic/test/tree/master/test', text: 'the tests' }),
    ' on GitHub.',
  ]),
]
