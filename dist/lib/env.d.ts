/**
 * Check if NODE_ENV is set to 'production'
 */
export declare const isNodeProd: () => boolean
/**
 * Check if NODE_ENV is set to 'development'
 */
export declare const isNodeDev: () => boolean
/**
 * Check if the '-p' argument is present in process.argv
 */
export declare const isProd: () => boolean
/**
 * Check if the '-l' argument is present in process.argv
 */
export declare const isVerbose: () => boolean
/**
 * Get the error length limit from environment variable
 * Returns 0 for no limit (--verbose sets this), undefined if not set
 */
export declare const getErrorLength: () => number | undefined
export declare const env: {
  isNodeProd: () => boolean
  isNodeDev: () => boolean
  isProd: () => boolean
  isVerbose: () => boolean
  getErrorLength: () => number | undefined
}
