/**
 * Collection of JavaScript types to test anything against
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
export declare const vals: {
  array: string[]
  true: boolean
  false: boolean
  truthy: string
  falsy: number
  nil: null
  emptystr: string
  emptyobject: {}
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
  rgb: {
    r: number
    g: number
    b: number
  }
  rgba: {
    r: number
    g: number
    b: number
    a: number
  }
  hex3: string
  hex6: string
  hexa4: string
  hexa8: string
  regexp: RegExp
}
