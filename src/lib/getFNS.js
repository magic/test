/**
 * Get function names from environment variable FN
 * @param {NodeJS.ProcessEnv} [env=process.env] - Environment variables object
 * @returns {string | string[]} - Either a string or array of function names
 */
export const getFNS = (env = process.env) => {
  let { FN = '' } = env

  if (FN) {
    if (FN.includes(' ')) {
      return FN.split(/ ,;/).filter(a => a)
    }
  }

  return FN
}
