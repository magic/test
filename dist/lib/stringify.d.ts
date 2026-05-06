import type { InputValue, JsonSafe } from '../types.ts'
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
export declare const stringify: (object: InputValue) => JsonSafe
