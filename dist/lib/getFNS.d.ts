/**
 * Get function names from environment variable FN
 * Always returns an array (empty when unset) so callers can use exact matching.
 */
export declare const getFNS: (env?: NodeJS.ProcessEnv) => string[]
