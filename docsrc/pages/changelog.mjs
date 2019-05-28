export const View = () => [
  h2('Changelog'),

  h3('0.1.0'),
  p('use esmodules instead of commonjs.'),

  h3('0.1.1'),
  p('rework of bin scripts and update dependencies to esmodules'),

  h3('0.1.2'),
  p('cli now works on windows again (actually, this version is broken on all platforms.)'),

  h3('0.1.3'),
  p('cli now works everywhere'),

  h3('0.1.4'),
  p('npm run scripts of @magic/test itself can be run on windows.'),

  h3('0.1.5'),
  p('use ecmascript version of @magic/deep'),

  h3('0.1.6'),
  p('update this readme and html docs.'),
  p('tests should always process.exit(1) if they errored.'),

  h3('0.1.7'),
  p('readded calls npm run script'),
  p('updated c8'),

  h3('0.1.8'),
  p('update @magic/cli'),

  h3('0.1.9'),
  p('test/beforeAll.mjs gets loaded separately if it exists and executed before all tests'),
  p('test/afterAll.mjs gets loaded separately if it exists and executed after all tests'),
  p([
    'if the function exported from test/beforeAll.mjs returns another function,',
    'this function will also be executed after all tests',
  ]),
]