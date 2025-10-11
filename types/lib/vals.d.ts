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
export const vals: Readonly<{
  array: string[]
  true: true
  false: false
  truthy: string
  falsy: number
  nil: null
  emptystr: string
  emptyobject: Record<string, never>
  emptyarray: never[]
  func: () => void
  number: number
  num: number
  float: number
  int: number
  object: {
    test: string
  }
  obj: {
    t: string
  }
  string: string
  str: string
  email: string
  undefined: undefined
  undef: undefined
  date: Date
  time: number
  error: Error
  err: Error
  rgb: RGB
  rgba: RGBA
  hex3: string
  hex6: string
  hexa4: string
  hexa8: string
  regexp: RegExp
}>
export type RGB = {
  /**
   * - Red value
   */
  r: number
  /**
   * - Green value
   */
  g: number
  /**
   * - Blue value
   */
  b: number
}
export type RGBA = {
  /**
   * - Red value
   */
  r: number
  /**
   * - Green value
   */
  g: number
  /**
   * - Blue value
   */
  b: number
  /**
   * - Alpha value
   */
  a: number
}
//# sourceMappingURL=vals.d.ts.map
