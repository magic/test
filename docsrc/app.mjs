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
        { to: '#getting-started-install', text: 'install' },
        { to: '#getting-started-npm-scripts', text: 'npm scripts' },
      ],
    },
{
          to: '#tests-types',
          text: 'testing types'
        },
        {
          to: '#caveat',
          text: 'caveat'
        },
    {
      to: '/#tests',
      text: 'writing tests',
      items: [
        { to: '#tests-types', text: 'testing types' },
        { to: '#tests-typescript', text: 'typescript' },
        { to: '#tests-multiple', text: 'multiple tests in one file' },
        { to: '#tests-runs', text: 'running tests multiple times' },
        { to: '#tests-promises', text: 'promises' },
        { to: '#tests-cb', text: 'callback functions' },
        {
          to: '#tests-hooks',
          text: 'run function before / after individual tests',
        },
{
          to: '#test-suites-data',
          text: 'data based test suites'
        },
        {
          to: '#important---file-mappings',
          text: 'important file mappings'
        },
        {
          to: '#tests-each-hooks',
          text: 'beforeEach and afterEach',
        },
        {
          to: '#tests-magic-modules',
          text: 'test @magic-modules',
        },
      ],
    },
    {
      to: '/#lib',
      text: 'utility functions',
      items: [
        { to: '#lib-deep', text: 'deep' },
        { to: '#lib-fs', text: 'fs' },
        { to: '#lib-curry', text: 'curry' },
        { to: '#lib-log', text: 'log' },
        { to: '#lib-vals', text: 'vals' },
        { to: '#lib-env', text: 'env' },
        { to: '#lib-env-constants', text: 'Environment Constants' },
        { to: '#lib-promises', text: 'promises' },
        { to: '#lib-http', text: 'http' },
        { to: '#lib-trycatch', text: 'tryCatch' },
        { to: '#lib-error', text: 'error' },
        { to: '#lib-version', text: 'version' },
        { to: '#lib-mock', text: 'mock' },
        { to: '#lib-dom', text: 'DOM Environment' },
        { to: '#lib-svelte', text: 'svelte' },
        { to: '#compileSvelte', text: 'compileSvelte' },
      ],
    },
    {
      to: '/#native-runner',
      text: 'Native Node.js Test Runner',
      items: [
        { to: '#native-usage', text: 'Usage' },
        { to: '#native-external', text: 'Using in External Libraries' },
        { to: '#native-features', text: 'Features' },
        { to: '#native-differences', text: 'Differences from Custom Runner' },
        { to: '#test-isolation', text: 'Test Isolation' },
      ],
    },
    {
      to: '/#usage',
      text: 'usage',
      items: [
        { to: '#usage-js', text: 'js api' },
        { to: '#usage-cli', text: 'cli' },
        { to: '#usage-global', text: 'npm i -g' },
        { to: '#exit-codes', text: 'Exit Codes' },
        { to: '#performance-tips', text: 'Performance Tips' },
        { to: '#verbose-output', text: 'Verbose Output' },
        { to: '#common-pitfalls', text: 'Common Pitfalls' },
      ],
    },
  ],
}
