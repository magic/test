/**
 * Get function names from environment variable FN
 * @param {NodeJS.ProcessEnv} [env=process.env] - Environment variables object
 * @returns {string | string[]} - Either a string or array of function names
 */
export const getFNS = (env = process.env) => {
  const fn = env.FN || ''
  return fn.includes(' ') ? fn.split(/ ,;/).filter(Boolean) : fn
}
