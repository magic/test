import is from '@magic/types'

/**
 * @typedef {string | number | boolean | null | undefined | object} JsonSafe
 */

/**
 * @typedef {JsonSafe | (() => unknown)} JsonSafeArg
 */

/**
 * All acceptable input types to `stringify`, including functions and nested structures.
 * @typedef {JsonSafeArg | JsonSafeArg[]} InputValue
 */

/**
 * Recursively stringifies parts of an input value to make it JSON-safe.
 * Useful for cleaning data before logging or serialization.
 *
 * - Strings are truncated to 70 characters max
 * - Functions (or anything with `.toString`) are converted to strings
 * - Arrays and objects are processed recursively
 * - Primitives (boolean, number, null, undefined) are returned unchanged
 *
 * @param {InputValue} object - The input value to process.
 * @returns {JsonSafe} A JSON-safe representation of the input.
 *
 * @example
 * stringify({ fn: () => 'test', str: 'a'.repeat(100) })
 * // { fn: '() => "test"', str: 'aaa...aaa' } (70 chars)
 *
 * @example
 * stringify([1, () => 2, { nested: true }])
 * // [1, '() => 2', { nested: true }]
 */
export const stringify = object => {
  if (is.string(object)) {
    return object.substring(0, 70)
  } else if (is.function(object)) {
    return object.toString()
  } else if (is.array(object)) {
    return object.map(o => /** @type {InputValue} */ (o)).map(stringify)
  } else if (is.objectNative(object)) {
    Object.entries(object).forEach(([k, v]) => {
      object[k] = stringify(/** @type {InputValue} */ (v))
    })
  }

  return object
}
