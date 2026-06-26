export const View = state => [
  h1({ id: 'lib' }, 'Utility Belt'),

  p([
    '@magic/test exports some utility functions',
    ' that make working with complex test workflows simpler.',
  ]),

  h2({ id: 'lib-deep' }, 'deep'),

  p([
    'Exported from ',
    Link({ to: 'https://github.com/magic/deep', text: '@magic/deep' }),
    ', deep equality and comparison utilities.',
  ]),

  Pre(`
import { deep, is } from '@magic/test'

export default [
  {
    fn: () => ({ a: 1, b: 2 }),
    expect: deep.equal({ a: 1, b: 2 }),
    info: 'deep equals comparison',
  },
  {
    fn: () => ({ a: 1 }),
    expect: deep.different({ a: 2 }),
    info: 'deep different comparison',
  },
  {
    fn: () => ({ a: { b: 1 } }),
    expect: deep.equal({ a: { b: 1 } }),
    info: 'nested deep equality',
  },
]
`),

  p('Available functions:'),

  ul([
    li('deep.equal(a, b) - deep equality check'),
    li('deep.different(a, b) - deep difference check'),
    li('deep.contains(container, item) - deep inclusion check'),
    li('deep.changes(a, b) - get differences between objects'),
  ]),

  h2({ id: 'lib-fs' }, 'fs'),

  p([
    'Exported from ',
    Link({ to: 'https://github.com/magic/fs', text: '@magic/fs' }),
    ', file system utilities.',
  ]),

  Pre(`
import { fs } from '@magic/test'

export default [
  {
    fn: async () => {
      const content = await fs.readFile('./package.json', 'utf-8')
      return content.includes('name')
    },
    expect: true,
    info: 'read file content',
  },
]
`),

  p('Common methods:'),

  ul([
    li('fs.readFile(path, encoding) - read file content'),
    li('fs.writeFile(path, data) - write file content'),
    li('fs.exists(path) - check if file exists'),
    li('fs.mkdir(path, options) - create directory'),
    li('fs.rmdir(path) - remove directory'),
    li('fs.stat(path) - get file stats'),
    li('fs.readdir(path) - read directory contents'),
    li('Plus async versions in fs.promises'),
  ]),

  h2({ id: 'lib-curry' }, 'curry'),

  p([
    'Currying can be used to split the arguments of a function into multiple nested functions.',
    ' This helps if you have a function with complicated arguments that you just want to quickly shim.',
  ]),
  Pre(`
import { curry } from '@magic/test'

const compare = (a, b) => a === b
const curried = curry(compare)
const shimmed = curried('shimmed_value')

export default {
  fn: shimmed('shimmed_value'),
  expect: true,
  info: 'expect will be called with a and b and a will equal b',
}
`),

  h2({ id: 'lib-log' }, 'log'),

  p('Logging utility for test output. Colors supported automatically.'),

  Pre(`
import { log } from '@magic/test'

log.debug('Debug info')
log.info('Something happened')
log.warn('Heads up')
log.error('Something went wrong')
log.critical('Game over')
`),

  p('Supports multiple arguments:'),

  Pre(`
log.info('Testing', library, 'at version', version)
`),

  h2({ id: 'lib-vals' }, 'vals'),

  p([
    'Exports JavaScript type constants for testing against any value.',
    ' Useful for fuzzing and property-based testing.',
  ]),

  Pre(`
import { vals, is } from '@magic/test'

export default [
  { fn: () => 'test', expect: is.string, info: 'test if value is a string' },
  { fn: () => vals.true, expect: true, info: 'boolean true value' },
  { fn: () => vals.email, expect: is.email, info: 'valid email format' },
  { fn: () => vals.error, expect: is.error, info: 'error instance' },
]
`),

  p('Available Constants:'),

  ul([
    li('Primitives: true, false, number, num, float, int, string, str'),
    li('Empty values: nil, emptystr, emptyobject, emptyarray, undef'),
    li('Collections: array, object, obj'),
    li('Time: date, time'),
    li('Errors: error, err'),
    li('Colors: rgb, rgba, hex3, hex6, hexa4, hexa8'),
    li('Other: func, truthy, falsy, email, regexp'),
  ]),

  h2({ id: 'lib-env' }, 'env'),

  p('Environment detection utilities for conditional test behavior.'),

  p('Available utilities:'),

  ul([
    li('isNodeProd - checks if NODE_ENV is set to production'),
    li('isNodeDev - checks if NODE_ENV is set to development'),
    li('isProd - checks if -p flag is passed to the CLI'),
    li('isVerbose - checks if -l flag is passed to the CLI'),
    li(
      'getErrorLength - returns error length limit from MAGIC_TEST_ERROR_LENGTH env var (0 = unlimited)',
    ),
  ]),

  Pre(`
import { env, isProd, isTest, isDev } from '@magic/test'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'checks if NODE_ENV is production',
  },
  {
    fn: env.isNodeDev,
    expect: process.env.NODE_ENV === 'development',
    info: 'checks if NODE_ENV is development',
  },
  {
    fn: env.isProd,
    expect: process.argv.includes('-p'),
    info: 'checks if -p flag is passed',
  },
  {
    fn: env.isVerbose,
    expect: process.argv.includes('-l'),
    info: 'checks if -l flag is passed',
  },
  {
    fn: env.getErrorLength,
    expect: 70,
    info: 'get error length limit',
  },
]
`),

  h3({ id: 'lib-env-constants' }, 'Environment Constants'),

  p('These boolean constants reflect the current NODE_ENV:'),

  Pre(`
import { isProd, isTest, isDev } from '@magic/test'

export default [
  { fn: isProd, expect: process.env.NODE_ENV === 'production' },
  { fn: isTest, expect: process.env.NODE_ENV === 'test' },
  { fn: isDev, expect: process.env.NODE_ENV === 'development' },
]
`),

  h2({ id: 'lib-promises' }, 'promises'),

  p([
    'Helper function to wrap nodejs callback functions and promises with ease.',
    ' Handles the try/catch steps internally and returns a resolved or rejected promise.',
  ]),
  Pre(`
import { promise, is } from '@magic/test'

export default [
  {
    fn: promise(cb => setTimeout(() => cb(null, true), 200)),
    expect: true,
    info: 'handle promises in a nice way',
  },
  {
    fn: promise(cb => setTimeout(() => cb(new Error('error'), 200)),
    expect: is.error,
    info: 'handle promise errors in a nice way',
  },
]
`),

  h2({ id: 'lib-http' }, 'http'),

  p('HTTP utility for making requests in tests. Supports both HTTP and HTTPS.'),

  Pre(`
import { http } from '@magic/test'

export default [
  {
    fn: http.get('https://api.example.com/data'),
    expect: { success: true },
    info: 'fetches data from API',
  },
  {
    fn: http.post('https://api.example.com/users', { name: 'John' }),
    expect: { id: 1, name: 'John' },
    info: 'creates a new user',
  },
  {
    fn: http.post('http://localhost:3000/data', 'raw string'),
    expect: 'raw string',
    info: 'posts raw string data',
  },
]
`),

  p('Error Handling:'),

  Pre(`
import { http, is } from '@magic/test'

export default [
  {
    fn: http.get('https://invalid-domain-that-does-not-exist.com'),
    expect: is.error,
    info: 'rejects on network error',
  },
  {
    fn: http.get('https://api.example.com/nonexistent'),
    expect: res => res.status === 404,
    info: 'handles 404 responses',
  },
]
`),

  p('Note: HTTP module automatically handles:'),

  ul([
    li('Protocol detection (HTTP vs HTTPS)'),
    li('JSON parsing for responses with Content-Type: application/json'),
    li('Raw string returns for non-JSON responses'),
    li('rejectUnauthorized: false for self-signed certificates'),
  ]),

  h3({}, 'HttpOptions'),

  Pre(`
import type { HttpOptions } from '@magic/test'
`),

  p('| Option | Type | Default | Description |'),
  p('| ------ | ---- | ------- | ----------- |'),
  p('| timeout | number | 30000 | Request timeout in milliseconds |'),
  p('| rejectUnauthorized | boolean | true | Reject self-signed certs |'),
  p('| maxSize | number | - | Maximum response size in bytes |'),
  p('| requestOptions | RequestOptions | - | Additional request options |'),

  h2({ id: 'lib-trycatch' }, 'trycatch'),

  p('allows to catch and test functions without bubbling the errors up into the runtime'),

  Pre(`
import { is, tryCatch } from '@magic/test'

const throwing = () => throw new Error('oops')
const healthy = () => true

export default [
  {
    fn: tryCatch(throwing()),
    expect: is.error,
    info: 'function throws an error',
  },
  {
    fn: tryCatch(healthy()),
    expect: true,
    info: 'function does not throw',
  },
]
`),

  h2({ id: 'lib-error' }, 'error'),

  p([
    'exports ',
    Link({ to: 'https://github.com/magic/error', text: '@magic/error' }),
    ' which returns errors with optional names.',
  ]),

  Pre(`
import { error } from '@magic/test'

export default [
  {
    fn: tryCatch(error('Message', 'E_NAME')),
    expect: e => e.name === 'E_NAME' && e.message === 'Message',
    info: 'Errors have messages and (optional) names.',
  },
]
`),

  h2({ id: 'lib-mock' }, 'mock'),

  p('Mock and spy utilities for function testing.'),

  Pre(`
import { mock, tryCatch } from '@magic/test'

export default [
  {
    fn: () => {
      const spy = mock.fn()
      spy('arg1')
      return spy.calls.length === 1 && spy.calls[0][0] === 'arg1'
    },
    expect: true,
    info: 'mock.fn tracks call arguments',
  },
  {
    fn: () => {
      const spy = mock.fn().mockReturnValue('mocked')
      return spy() === 'mocked'
    },
    expect: true,
    info: 'mock.fn.mockReturnValue sets return value',
  },
  {
    fn: async () => {
      const spy = mock.fn().mockThrow(new Error('fail'))
      const caught = await tryCatch(spy)()
      return caught instanceof Error
    },
    expect: true,
    info: 'mock.fn.mockThrow works with tryCatch',
  },
  {
    fn: () => {
      const obj = { greet: () => 'hello' }
      const spy = mock.spy(obj, 'greet', () => 'world')
      const result = obj.greet()
      spy.mockRestore()
      return result === 'world' && obj.greet() === 'hello'
    },
    expect: true,
    info: 'mock.spy replaces and restores methods',
  },
]
`),

  h3({}, 'mock.fn properties'),

  ul([
    li('calls - Array of all call arguments'),
    li('returns - Array of all return values'),
    li('errors - Array of all thrown errors (null for non-throwing calls)'),
    li('callCount - Number of times called'),
  ]),

  h3({}, 'mock.fn methods'),

  ul([
    li('mockReturnValue(value) - Set return value (chainable)'),
    li('mockThrow(error) - Set error to throw (chainable)'),
    li('getCalls() - Get all call arguments'),
    li('getReturns() - Get all return values'),
    li('getErrors() - Get all thrown errors'),
  ]),

  h3({ id: 'lib-mock-log' }, 'mock.log'),

  p('Logging utilities that respect NODE_ENV for conditional output:'),

  Pre(`
import { mock } from '@magic/test'

mock.log.log('Debug info')      // Logs if not NODE_ENV=production
mock.log.warn('Heads up')       // Logs if not NODE_ENV=production
mock.log.error('Something went wrong')  // Always logs
mock.log.time('operation')     // Logs timing if not NODE_ENV=production
mock.log.timeEnd('operation')   // Logs timing end if not NODE_ENV=production
`),

  h2({ id: 'lib-has' }, 'has'),

  p([
    'Functions for asserting object properties without needing explicit type annotations',
    ' or stringifying functions.',
  ]),

  Pre(`
import { has, is } from '@magic/test'
`),

  h3({}, 'has.property(key, check)'),

  p('Check a single property. Accepts either a predicate or a literal value.'),

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

  h3({}, 'has.properties(spec)'),

  p('Check multiple properties. Mix predicates and literal values.'),

  Pre(`
{
  fn: () => getUser(),
  expect: has.properties({ name: is.string, age: is.num }),
  info: 'user has required properties',
}
`),

  h3({}, 'has.any(spec)'),

  p('Check at least one property matches. Accepts predicates or literals.'),

  Pre(`
{
  fn: () => parseResult(),
  expect: has.any({ error: is.error, data: is.object }),
  info: 'result has either error or data',
}
`),

  h3({}, 'has.nested(path, predicate)'),

  p('Check a nested property path.'),

  Pre(`
{
  fn: () => getData(),
  expect: has.nested('user.profile.name', is.string),
  info: 'deep nested property exists',
}
`),

  h3({}, 'has.string(substring)'),

  p('Check if value is a string containing substring.'),

  Pre(`
{
  fn: () => error.message,
  expect: has.string('failed to connect'),
  info: 'error message contains helpful context',
}
`),

  h3({}, 'has.key(keyName)'),

  p('Check if object has a specific key.'),

  h3({}, 'has.keys(keyNames[])'),

  p('Check if object has all specified keys.'),

  h3({}, 'has.includes(item)'),

  p('Check if array or string contains item (uses deep.equal for arrays).'),

  h3({}, 'has.oneOf(options[])'),

  p('Check if value equals one of the options (uses deep.equal).'),

  h3({}, 'has.matches(regex)'),

  p('Check if string matches regex pattern.'),

  h2({ id: 'lib-version' }, 'version'),

  p([
    'The version plugin checks your code according to a spec defined by you.',
    ' This is designed to warn you on changes to your exports.',
  ]),

  p([
    'Internally, the version function calls ',
    Link({ to: 'https://github.com/magic/types', text: '@magic/types' }),
    ' and all functions exported from it are valid type strings in version specs.',
  ]),

  Pre(`
import { version } from '@magic/test'

// import your lib as your codebase requires
// import * as lib from '../src/index.js'
// import lib from '../src/index.js

const spec = {
  stringValue: 'string',
  numberValue: 'number',

  objectValue: [
    'obj',
    {
      key: 'Willbechecked',
    },
  ],

  objectNoChildCheck: ['obj', false],
}

export default version(lib, spec)
`),

  p([
    "Using `['obj', false]` in a spec will test that the parent is an object",
    ' without checking the key/value pairs inside.',
  ]),

  h2({ id: 'lib-dom' }, 'DOM Environment'),

  p([
    '@magic/test automatically initializes a DOM environment when imported,',
    ' making browser APIs available in Node.js.',
  ]),

  h3({}, 'Available globals'),

  ul([
    li('Core: document, window, self, navigator, location, history'),
    li('DOM types: Node, Element, HTMLElement, SVGElement, Document, DocumentFragment'),
    li(
      'Events: Event, CustomEvent, MouseEvent, KeyboardEvent, InputEvent, TouchEvent, PointerEvent',
    ),
    li('Forms: FormData, File, FileList, Blob'),
    li('Networking: URL, URLSearchParams, XMLHttpRequest, fetch, WebSocket'),
    li('Storage: Storage, sessionStorage, localStorage'),
    li('Observers: MutationObserver, IntersectionObserver, ResizeObserver'),
    li('Timers: setTimeout, setInterval, requestAnimationFrame'),
  ]),

  h3({}, 'DOM Utilities'),

  Pre(`
import { initDOM, getDocument, getWindow } from '@magic/test'

// Get the document and window instances
const doc = getDocument()
const win = getWindow()

// Manually re-initialize if needed
initDOM()
`),

  h3({}, 'Canvas/Image Polyfills'),

  ul([
    li('new Image() - Parses PNG data URLs to extract dimensions'),
    li('canvas.getContext("2d") - Returns node-canvas context'),
    li('canvas.toDataURL() - Serializes canvas to data URL'),
  ]),
]
