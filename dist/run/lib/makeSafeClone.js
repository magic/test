import is from '@magic/types'
/**
 * Convert a value to a structuredClone-safe representation.
 * Tries to keep the value as-is if it's cloneable; otherwise reduces to a string/primitive.
 */
export const makeSafeClone = value => {
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
    // Fallback: convert to a string representation (or keep undefined/null)
    if (value === undefined || value === null) {
      return value
    }
    if (
      is.string(value) ||
      is.number(value) ||
      is.boolean(value) ||
      value instanceof BigInt ||
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
