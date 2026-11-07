/**
 * Get function names from environment variable FN
 * Always returns an array (empty when unset) so callers can use exact matching.
 */
export const getFNS = (env = process.env) => {
  const fn = env.FN || ''
  return fn.split(/[ ,;]/).filter(Boolean)
}
//# sourceMappingURL=getFNS.js.map
