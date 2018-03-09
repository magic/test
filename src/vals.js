// collection of javascript types to test anything against

const vals = {
  array: ['test'],
  true: true,
  false: false,
  truthy: 'true',
  falsy: 0,
  nil: null,
  emptystr: '',
  emptyobject: {},
  emptyarray: [],
  func: () => {},
  float: 1.1,
  int: 1,
  object: { test: 'name' },
  str: 'str',
  email: 'test@mail.mail',
  undef: undefined,
  date: new Date(),
  error: new Error('testerror'),
  rgb: { r: 1, g: 1, b: 1 },
  rgba: { r: 1, g: 1, b: 1, a: 1 },
  hex3: '#3d3',
  hex6: '#3d3d3d',
  hexa4: '#3d31',
  hexa8: '#3d3d3111',
  regexp: /test/,
}

module.exports = vals
