/**
 * @typedef {Record<string, string>} ErrorCodeMap
 */
/**
 * @typedef {Record<string, string | ((...args: unknown[]) => string)>} ErrorMessageMap
 */
/**
 * @typedef {Error & { code?: string }} CustomError
 */
/** @type {ErrorCodeMap} */
export const ERRORS: ErrorCodeMap
/** @type {ErrorMessageMap} */
export const ERROR_MESSAGES: ErrorMessageMap
export function createError(code: string, message: string): CustomError
export function errorify(code: string, data: any): CustomError
export type ErrorCodeMap = Record<string, string>
export type ErrorMessageMap = Record<string, string | ((...args: unknown[]) => string)>
export type CustomError = Error & {
  code?: string
}
//# sourceMappingURL=errors.d.ts.map
