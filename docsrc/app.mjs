export const state = {
  title: '@magic/test',

  description: [
    'Declaratively test your ecmascript module files.',
    ' No transpiling required.',
    ' Incredibly fast.',
  ],

  logotext: '@magic/test',

  menu: [
    { to: '/', text: 'Home' },
    { to: '/#getting-started', text: 'Getting Started' },
    {
      to: '/writing-tests/',
      text: 'Writing Tests',
      items: [
        { to: '/writing-tests/#tests', text: 'Single Test' },
        { to: '/writing-tests/#tests-multiple', text: 'Multiple Tests' },
        { to: '/writing-tests/#tests-runs', text: 'Running Multiple Times' },
        { to: '/writing-tests/#tests-types', text: 'Testing Types' },
        { to: '/writing-tests/#tests-promises', text: 'Promises' },
        { to: '/writing-tests/#tests-cb', text: 'Callbacks' },
        { to: '/writing-tests/#tests-hooks', text: 'Hooks' },
        { to: '/writing-tests/#tests-suite-hooks', text: 'Suite Hooks' },
        { to: '/writing-tests/#tests-each-hooks', text: 'beforeEach/afterEach' },
        { to: '/writing-tests/#tests-magic-modules', text: 'Magic Modules' },
        { to: '/writing-tests/#test-suites', text: 'Test Suites' },
      ],
    },
    {
      to: '/lib/',
      text: 'Utilities',
      items: [
        { to: '/lib/#lib-deep', text: 'deep' },
        { to: '/lib/#lib-fs', text: 'fs' },
        { to: '/lib/#lib-curry', text: 'curry' },
        { to: '/lib/#lib-log', text: 'log' },
        { to: '/lib/#lib-vals', text: 'vals' },
        { to: '/lib/#lib-env', text: 'env' },
        { to: '/lib/#lib-promises', text: 'promises' },
        { to: '/lib/#lib-http', text: 'http' },
        { to: '/lib/#lib-trycatch', text: 'tryCatch' },
        { to: '/lib/#lib-error', text: 'error' },
        { to: '/lib/#lib-mock', text: 'mock' },
        { to: '/lib/#lib-mock-log', text: 'mock.log' },
        { to: '/lib/#lib-has', text: 'has' },
        { to: '/lib/#lib-version', text: 'version' },
        { to: '/lib/#lib-dom', text: 'DOM Environment' },
      ],
    },
    {
      to: '/svelte/',
      text: 'Svelte',
      items: [
        { to: '/svelte/#lib-svelte', text: 'mount' },
        { to: '/svelte/#svelte-state', text: 'Component State' },
        { to: '/svelte/#svelte-auto-export', text: 'Auto Exports' },
        { to: '/svelte/#svelte-error', text: 'Error Handling' },
        { to: '/svelte/#lib-sveltekit-mocks', text: 'SvelteKit Mocks' },
        { to: '/svelte/#lib-create-static-page', text: 'createStaticPage' },
        { to: '/svelte/#lib-compile-svelte', text: 'compileSvelte' },
      ],
    },
    {
      to: '/cli/',
      text: 'CLI & Usage',
      items: [
        { to: '/cli/#cli-packagejson', text: 'package.json Setup' },
        { to: '/cli/#cli-global', text: 'Global Install' },
        { to: '/cli/#cli-flags', text: 'CLI Flags' },
        { to: '/cli/#sharding', text: 'Sharding Tests' },
        { to: '/cli/#exit-codes', text: 'Exit Codes' },
        { to: '/cli/#verbose-output', text: 'Verbose Output' },
        { to: '/cli/#performance-tips', text: 'Performance Tips' },
        { to: '/cli/#common-pitfalls', text: 'Common Pitfalls' },
      ],
    },
    {
      to: '/test-isolation/',
      text: 'Test Isolation',
      items: [{ to: '/test-isolation/#isolate', text: '__isolate' }],
    },
    {
      to: '/error-codes/',
      text: 'Error Codes',
    },
    {
      to: '/changelog/',
      text: 'Changelog',
    },
  ],
}
