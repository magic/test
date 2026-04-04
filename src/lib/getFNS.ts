/**
 * Get function names from environment variable FN
 */
export const getFNS = (env = process.env) => {
  const fn = env.FN || ''
  return fn.includes(' ') ? fn.split(/ ,;/).filter(Boolean) : fn
}
