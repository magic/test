import is from '@magic/types'
import { env } from './env.js'
import type { InputValue, JsonSafe } from '../types.js'

/**
 * Recursively stringifies parts of an input value to make it JSON-safe.
 * Useful for cleaning data before logging or serialization.
 *
 * - Strings are truncated based on MAGIC_TEST_ERROR_LENGTH env var (default 70)
 * - If --verbose is set, no truncation occurs
 * - If --error-length N is set, strings are truncated to N characters
 * - Functions (or anything with `.toString`) are converted to strings
 * - Arrays and objects are processed recursively
 * - Primitives (boolean, number, null, undefined) are returned unchanged
 *
 *
 * stringify({ fn: () => 'test', str: 'a'.repeat(100) })
 * // { fn: '() => "test"', str: 'aaa...aaa' } (70 chars)
 *
 * stringify([1, () => 2, { nested: true }])
 * // [1, '() => 2', { nested: true }]
 */
export const stringify = (object: InputValue): JsonSafe => {
  if (is.string(object)) {
    const errorLength = env.getErrorLength()

    if (errorLength === 0) {
      return object
    }

    const limit = errorLength || 70
    if (object.length <= limit) {
      return object
    }
    return object.substring(0, limit)
  } else if (is.function(object)) {
    return object.toString()
  } else if (Array.isArray(object)) {
    return object.map(item => stringify(item as InputValue))
  } else if (is.objectNative(object)) {
    const copy = { ...(object as Record<string, unknown>) }
    for (const [k, v] of Object.entries(copy)) {
      copy[k] = stringify(v as InputValue)
    }
    return copy
  }

  return object
}
