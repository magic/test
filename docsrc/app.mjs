export const state = {
  title: '@magic/test',

  description: [
    'simple tests with lots of utility. ecmascript modules only.',
    'runs ecmascript module tests without transpilation.',
    'unbelievably fast.',
  ],

  logotext: '@magic/test',

  menu: [
    {
      to: '/#getting-started',
      text: 'getting started',
      items: [
        { to: '-install', text: 'install' },
        { to: '-npm-scripts', text: 'npm scripts' },
      ],
    },
    {
      to: '/#tests-types',
      text: 'testing types',
    },
    {
      to: '#caveat',
      text: 'caveat',
    },
    {
      to: '/#tests',
      text: 'writing tests',
      items: [
        { to: '-types', text: 'testing types' },
        { to: '-typescript', text: 'typescript' },
        { to: '-multiple', text: 'multiple tests in one file' },
        { to: '-runs', text: 'running tests multiple times' },
        { to: '-promises', text: 'promises' },
        { to: '-cb', text: 'callback functions' },
        {
          to: '-hooks',
          text: 'run function before / after individual tests',
        },
        {
          to: '-suites-data',
          text: 'data based test suites',
        },
        {
          to: '-file-mappings',
          text: 'important file mappings',
        },
        {
          to: '-each-hooks',
          text: 'beforeEach and afterEach',
        },
        {
          to: '-magic-modules',
          text: 'test @magic-modules',
        },
      ],
    },
    {
      to: '/#lib',
      text: 'utility functions',
      items: [
        { to: '-deep', text: 'deep' },
        { to: '-fs', text: 'fs' },
        { to: '-curry', text: 'curry' },
        { to: '-log', text: 'log' },
        { to: '-vals', text: 'vals' },
        { to: '-env', text: 'env' },
        { to: '-env-constants', text: 'Environment Constants' },
        { to: '-promises', text: 'promises' },
        { to: '-http', text: 'http' },
        { to: '-trycatch', text: 'tryCatch' },
        { to: '-error', text: 'error' },
        { to: '-version', text: 'version' },
        { to: '-mock', text: 'mock' },
        { to: '-dom', text: 'DOM Environment' },
        { to: '-svelte', text: 'svelte' },
        { to: '-compile-svelte', text: 'compileSvelte' },
      ],
    },
    {
      to: '/#native-runner',
      text: 'Native Node.js Test Runner',
      items: [
        { to: '-usage', text: 'Usage' },
        { to: '-external', text: 'Using in External Libraries' },
        { to: '-features', text: 'Features' },
        { to: '-differences', text: 'Differences from Custom Runner' },
      ],
    },
    { to: '/#test-isolation', text: 'Test Isolation' },
    {
      to: '/#usage',
      text: 'usage',
      items: [
        { to: '-js', text: 'js api' },
        { to: '-cli', text: 'cli' },
        { to: '-global', text: 'npm i -g' },
        { to: '-exit-codes', text: 'Exit Codes' },
        { to: '-performance-tips', text: 'Performance Tips' },
        { to: '-verbose-output', text: 'Verbose Output' },
        { to: '-common-pitfalls', text: 'Common Pitfalls' },
      ],
    },
  ],
}
