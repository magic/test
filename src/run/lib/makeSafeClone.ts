import is from '@magic/types'

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
export const makeSafeClone = (value: unknown): unknown => sanitizeValue(value, new WeakMap())

const sanitizeValue = (value: unknown, seen: WeakMap<object, unknown>): unknown => {
  if (value === null || !is.object(value)) {
    // Primitives pass through; a top-level function cannot be cloned.
    return is.function(value) ? value.toString() : value
  }

  if (is.function(value)) {
    return value.toString()
  }

  if (seen.has(value as object)) {
    return seen.get(value as object)
  }

  if (is.error(value)) {
    return value
  }

  if (is.arr(value)) {
    const copy: unknown[] = []
    seen.set(value as object, copy)
    for (const v of value) {
      copy.push(sanitizeValue(v, seen))
    }
    return copy
  }

  if (is.date(value)) {
    return new Date(value.getTime())
  }

  if (is.regex(value)) {
    return new RegExp(value.source, value.flags)
  }

  if (is.set(value)) {
    const out = new Set()
    seen.set(value as object, out)
    for (const v of value) {
      out.add(sanitizeValue(v, seen))
    }
    return out
  }

  if (is.map(value)) {
    const out = new Map()
    seen.set(value as object, out)
    for (const [k, v] of value) {
      out.set(sanitizeValue(k, seen), sanitizeValue(v, seen))
    }
    return out
  }

  if (value instanceof ArrayBuffer) {
    return value.slice()
  }

  if (ArrayBuffer.isView(value)) {
    try {
      return (value as unknown as { slice(): unknown }).slice()
    } catch {
      return value
    }
  }

  // Plain object (and anything else): copy own enumerable string keys,
  // sanitizing recursively. Symbol keys and prototype methods are dropped —
  // payloads are data, not live objects.
  const copy: Record<string, unknown> = {}
  seen.set(value as object, copy)
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    copy[k] = sanitizeValue(v, seen)
  }
  return copy
}
