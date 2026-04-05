/**
 * Formats a number with fixed decimals and converts to number type.
 */
export const toMinimalFixed = (p: number, fix = 2): number => parseFloat(p.toFixed(fix))
