import is from '@magic/types'

/**
 * Convert a value to a structuredClone-safe representation.
 * Tries to keep the value as-is if it's cloneable; otherwise reduces to a string/primitive.
 */
export const makeSafeClone = (value: unknown): unknown => {
  try {
    // Quick path: primitives are safe
    if (value === null || !is.object(value)) {
      return value
    }
    // Functions cannot be cloned
    if (is.function(value)) {
      return value.toString()
    }
    // Attempt a structured clone to verify cloneability
    structuredClone(value)
    return value
  } catch {
    // Fallback: primitives pass through, objects get stringified
    if (
      value instanceof BigInt ||
      is.string(value) ||
      is.number(value) ||
      is.boolean(value) ||
      is.symbol(value)
    ) {
      return value
    }
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
}
