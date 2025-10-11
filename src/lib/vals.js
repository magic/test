/**
 * @typedef {Object} RGB
 * @property {number} r - Red value
 * @property {number} g - Green value
 * @property {number} b - Blue value
 */

/**
 * @typedef {Object} RGBA
 * @property {number} r - Red value
 * @property {number} g - Green value
 * @property {number} b - Blue value
 * @property {number} a - Alpha value
 */

/**
 * Collection of JavaScript types to test anything against
 * @type {Readonly<{
 *   array: string[],
 *   true: true,
 *   false: false,
 *   truthy: string,
 *   falsy: number,
 *   nil: null,
 *   emptystr: string,
 *   emptyobject: Record<string, never>,
 *   emptyarray: never[],
 *   func: () => void,
 *   number: number,
 *   num: number,
 *   float: number,
 *   int: number,
 *   object: { test: string },
 *   obj: { t: string },
 *   string: string,
 *   str: string,
 *   email: string,
 *   undefined: undefined,
 *   undef: undefined,
 *   date: Date,
 *   time: number,
 *   error: Error,
 *   err: Error,
 *   rgb: RGB,
 *   rgba: RGBA,
 *   hex3: string,
 *   hex6: string,
 *   hexa4: string,
 *   hexa8: string,
 *   regexp: RegExp
 * }>}
 */
export const vals = /** @type {const} */ ({
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
  number: 1234567890.0,
  num: 1237890,
  float: 1.1,
  int: 1,
  object: { test: 'test' },
  obj: { t: 't' },
  string: 'string',
  str: 'str',
  email: 'test@mail.mail',
  undefined: undefined,
  undef: undefined,
  date: new Date(),
  time: new Date().getTime(),
  error: new Error('test'),
  err: new Error('test'),
  rgb: { r: 1, g: 1, b: 1 },
  rgba: { r: 1, g: 1, b: 1, a: 1 },
  hex3: '#3d3',
  hex6: '#3d3d3d',
  hexa4: '#3d31',
  hexa8: '#3d3d3111',
  regexp: /test/,
})
