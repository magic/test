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
        { to: '-quick-tests', text: 'quick tests' },
        { to: '-coverage', text: 'coverage' },
      ],
    },
    {
      to: '/#test-suites',
      text: 'test suites',
      items: [
        { to: '-fs', text: 'fs based test suites' },
        { to: '-data', text: 'data based test suites' },
      ],
    },
    {
      to: '/#tests',
      text: 'writing tests',
      items: [
        { to: '-types', text: 'testing types' },
        { to: '-multiple', text: 'multiple tests in one file' },
        { to: '-promises', text: 'promises' },
        { to: '-cb', text: 'callback functions' },
        {
          to: '-hooks',
          text: 'run function before / after individual tests',
        },
        {
          to: '-suite-hooks',
          text: 'run function before / after suite of tests',
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
        { to: '-curry', text: 'curry' },
        { to: '-vals', text: 'vals' },
        { to: '-promises', text: 'promises' },
        { to: '-css', text: 'css' },
        { to: '-trycatch', text: 'tryCatch' },
      ],
    },
    {
      to: '/#usage',
      text: 'usage',
      items: [
        { to: '-js', text: 'js api' },
        { to: '-cli', text: 'cli' },
        { to: '-global', text: 'npm i -g' },
      ],
    },
  ],
}
