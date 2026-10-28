export const View = () => [
  h1({ id: 'has' }, 'has'),

  p([
    'Functions for asserting object properties, array contents, and string',
    ' values without needing explicit type annotations or stringifying',
    ' functions. Every has.* check returns a predicate, so it works directly',
    ' as a test expectation:',
  ]),

  Pre(`
import { has, is } from '@magic/test'

{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}
`),

  h2({ id: 'has-property' }, 'has.property(key, check)'),

  p('Check a single property. Accepts either a predicate or a literal value (uses is.deep.equal).'),

  Pre(`
// With predicate
{
  fn: () => getUser(),
  expect: has.property('name', is.string),
  info: 'user name is a string',
}

// With literal value (uses is.deep.equal)
{
  fn: () => getUser(),
  expect: has.property('age', 25),
  info: 'user age is 25',
}
`),

  h2({ id: 'has-properties' }, 'has.properties(spec)'),

  p('Check multiple properties. Mix predicates and literal values.'),

  Pre(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}

// All literals
{
  fn: () => getUser(),
  expect: has.properties({ name: 'John', age: 25 }),
  info: 'exact user match',
}
`),

  h2({ id: 'has-any' }, 'has.any(spec)'),

  p('Check at least one property matches. Accepts predicates or literals.'),

  Pre(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}

// With literals
{
  fn: () => parseResult(),
  expect: has.any({ error: 'not found', data: null }),
  info: 'result has specific error or null data',
}
`),

  h2({ id: 'has-nested' }, 'has.nested(path, check)'),

  p('Check a nested property path. Accepts predicates or literal values.'),

  Pre(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),

  h2({ id: 'has-string' }, 'has.string(...substring)'),

  p(
    'Check if value is a string containing every given substring. Substring entries can also be predicates receiving the full string.',
  ),

  Pre(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}

// can also check multiple args
{
  fn: () => error.message,
  expect: has.string('failed', 'to', 'connect'),
  info: 'error message contains all parts',
}
`),

  h2({ id: 'has-at' }, 'has.at(index, check)'),

  p(
    'Check the element at a given index of an array. Accepts a predicate, a literal value, or an array of checks (all must pass).',
  ),

  Pre(`
{
  fn: () => getItems(),
  expect: has.at(0, is.string),
  info: 'first item is a string',
}

// multiple checks must all pass
{
  fn: () => getItems(),
  expect: has.at(0, [is.string, item => item === 'first']),
  info: 'first item is the string "first"',
}
`),

  h2({ id: 'has-key' }, 'has.key(keyName)'),

  p('Check if object has a specific key.'),

  Pre(`
{
  fn: () => result,
  expect: has.key('data'),
  info: 'result has data key',
}
`),

  h2({ id: 'has-keys' }, 'has.keys(keyNames[])'),

  p('Check if object has all specified keys.'),

  Pre(`
{
  fn: () => user,
  expect: has.keys(['name', 'email']),
  info: 'user has required fields',
}
`),

  h2({ id: 'has-includes' }, 'has.includes(...items)'),

  p(
    'Check if array or string contains item (uses deep.equal for arrays). With multiple items, every item must be present.',
  ),

  Pre(`
const roles = ['admin', 'root', 'user']
{
  fn: () => roles,
  expect: has.includes('admin', 'root'),
  info: 'user has admin and root roles',
}
`),

  h2({ id: 'has-oneof' }, 'has.oneOf(...options)'),

  p('Check if value equals one of the options (uses deep.equal).'),

  Pre(`
// if only one arg and first arg is an array:
{
  fn: () => status,
  expect: has.oneOf(['pending', 'done', 'failed']),
  info: 'status is a valid value',
},
// also valid
{
  fn: () => status,
  expect: has.oneOf('pending', 'done', 'failed'),
  info: 'status is a valid value',
},
`),

  h2({ id: 'has-matches' }, 'has.matches(regex)'),

  p('Check if string matches regex pattern.'),

  Pre(`
{
  fn: () => phoneNumber,
  expect: has.matches(/^\d{3}-\d{4}$/),
  info: 'phone number is valid format',
}
`),

  h2({ id: 'has-not' }, 'has.not'),

  p([
    'Negated versions of every has.* check. has.not.X(...) passes exactly',
    ' when the matching has.X(...) would fail (pure logical negation):',
  ]),

  ul([
    li('has.not.property(key, check)'),
    li('has.not.properties(spec)'),
    li('has.not.any(spec)'),
    li('has.not.nested(path, check)'),
    li('has.not.string(substring)'),
    li('has.not.at(index, check)'),
    li('has.not.key(keyName)'),
    li('has.not.keys(keyNames[])'),
    li('has.not.includes(item)'),
    li('has.not.oneOf(options[])'),
    li('has.not.matches(regex)'),
  ]),

  Pre(`
{
  fn: () => status,
  expect: has.not.oneOf(['pending', 'done']),
  info: 'status is not a valid state',
}

{
  fn: () => error.message,
  expect: has.not.string('timeout'),
  info: 'error is not a timeout',
}

{
  fn: () => user,
  expect: has.not.property('isAdmin', true),
  info: 'user is not an admin',
}

{
  fn: () => items,
  expect: has.not.includes('admin'),
  info: 'items do not contain admin',
}
`),

  p([
    'Because the negation is logical, values the base check rejects also pass:',
    ' has.not.property(...)(null) is true, since has.property(...) is false',
    ' for null, and has.not.keys([])({...}) is false, since has.keys([])',
    ' always passes for objects.',
  ]),
]
