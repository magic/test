import type { CustomError } from '@magic/error'
export declare const ERRORS: Record<string, string>
export declare const ERROR_MESSAGES: {
  readonly E_EMPTY_SUITE: (test: string) => string
  readonly E_NO_TESTS: 'No test suites found.'
  readonly E_TEST_NO_FN: (test: string) => string
  readonly E_TEST_EXPECT: (test: string, error: Error) => string
  readonly E_TEST_BEFORE: (test: string, error: Error) => string
  readonly E_TEST_AFTER: (test: string, error: Error) => string
  readonly E_TEST_FN: (test: string, error: Error) => string
  readonly E_IMPORT: (msg: string) => string
}
/**
 * Create an error with a code
 */
export declare const createError: (code: string, message: string) => CustomError
