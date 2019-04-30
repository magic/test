module.exports = {
  state: {
    logotext: '@magic/test',
    menu: [
      { to: '/#dependencies', text: 'dependencies' },
      {
        to: '/#getting-started',
        text: 'getting started',
        items: [
          { to: '/#getting-started-install', text: 'install' },
          { to: '/#getting-started-npm-scripts', text: 'npm scripts' },
          { to: '/#getting-started-quick-tests', text: 'quick tests' },
          { to: '/#getting-started-coverage', text: 'coverage' },
        ],
      },
      {
        to: '/#test-suites',
        text: 'test suites',
        items: [
          { to: '/#test-suites-fs', text: 'fs based test suites' },
          { to: '/#test-suites-data', text: 'data based test suites' },
        ],
      },
      {
        to: '/#tests',
        text: 'writing tests',
        items: [
          { to: '/#tests-types', text: 'testing types' },
          { to: '/#tests-multiple', text: 'multiple tests in one file' },
          { to: '/#tests-promises', text: 'promises' },
          { to: '/#tests-cb', text: 'callback functions' },
          { to: '/#tests-hooks', text: 'run function before / after individual tests' },
          { to: '/#tests-suite-hooks', text: 'run function before / after suite of tests' },
        ],
      },
      {
        to: '/#lib',
        text: 'utility functions',
        items: [
          { to: '/#lib-curry', text: 'curry' },
          { to: '/#lib-vals', text: 'vals' },
          { to: '/#lib-trycatch', text: 'tryCatch' },
          { to: '/#lib-promises', text: 'promises' },
        ],
      },
      {
        to: '/#usage',
        text: 'Cli / Js Api Usage',
        items: [
          { to: '/#usage-js', text: 'js api' },
          { to: '/#usage-cli', text: 'cli' },
          { to: '/#usage-global', text: 'npm i -g' },
        ],
      },
    ],
  },
}
