export const state = {
  logotext: '@magic/test',
  menu: [
    { to: '/#dependencies', text: 'dependencies' },
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
      ],
    },
    {
      to: '/#lib',
      text: 'utility functions',
      items: [
        { to: '-curry', text: 'curry' },
        { to: '-vals', text: 'vals' },
        { to: '-trycatch', text: 'tryCatch' },
        { to: '-promises', text: 'promises' },
      ],
    },
    {
      to: '/#usage',
      text: 'Cli / Js Api Usage',
      items: [
        { to: '-js', text: 'js api' },
        { to: '-cli', text: 'cli' },
        { to: '-global', text: 'npm i -g' },
      ],
    },
  ],
}
