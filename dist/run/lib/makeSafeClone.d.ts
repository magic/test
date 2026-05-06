/**
 * Convert a value to a structuredClone-safe representation.
 * Tries to keep the value as-is if it's cloneable; otherwise reduces to a string/primitive.
 */
export declare const makeSafeClone: (value: unknown) => unknown
