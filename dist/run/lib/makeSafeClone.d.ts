/**
 * Recursively reduce a value to a structuredClone-safe representation.
 *
 * Functions (top-level or nested) become their source string; plain objects
 * and arrays are copied with their cloneable structure intact; Date/RegExp/
 * Set/Map/ArrayBuffer get proper copies; Errors pass through (structured
 * clone handles them). Circular references are preserved.
 *
 * This is used for worker postMessage payloads: a single unclonable value
 * (e.g. a function inside the test's result) would otherwise make
 * postMessage throw DataCloneError and kill the worker mid-batch.
 */
export declare const makeSafeClone: (value: unknown) => unknown
