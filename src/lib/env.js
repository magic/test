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
export const isVerbose = () => process.argv.includes('-l')

export const env = {
  isNodeProd,
  isProd,
  isVerbose,
}
