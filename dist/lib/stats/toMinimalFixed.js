/**
 * Formats a number with fixed decimals and converts to number type.
 */
export const toMinimalFixed = (p, fix = 2) => parseFloat(p.toFixed(fix))
