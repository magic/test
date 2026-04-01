/**
 * Check if NODE_ENV is set to 'production'
 * @returns {boolean}
 */
export const isNodeProd = () => process.env.NODE_ENV === 'production'

/**
 * Check if the '-p' argument is present in process.argv
 * @returns {boolean}
 */
export const isProd = () => process.argv.includes('-p')

/**
 * Check if the '-l' argument is present in process.argv
 * @returns {boolean}
 */
export const isVerbose = () => process.argv.includes('--verbose')

/**
 * Get the error length limit from environment variable
 * Returns 0 for no limit (--verbose sets this), undefined if not set
 * @returns {number | undefined}
 */
export const getErrorLength = () => {
  const envVal = process.env.MAGIC_TEST_ERROR_LENGTH
  if (envVal !== undefined) {
    return parseInt(envVal, 10)
  }
  if (isVerbose()) {
    return 0
  }
  return undefined
}

export const env = {
  isNodeProd,
  isProd,
  isVerbose,
  getErrorLength,
}
