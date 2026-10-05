export const View = () => [
  h1({ id: 'error-codes-quicklook' }, 'Error Codes Quick Look'),

  p('Quick reference for @magic/test error codes. Import from `@magic/test`:'),

  Pre(`
import { ERRORS, createError } from '@magic/test'
`),

  h2({}, 'Error Codes Reference Table'),

  Pre(
    '| Code | Description | Example Usage |\n| :--- | :---------- | :------------ |\n| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests | createError(ERRORS.E_EMPTY_SUITE, "Empty test suite") |\n| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite | createError(ERRORS.E_RUN_SUITE_UNKNOWN, "Unexpected execution error") |\n| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property | createError(ERRORS.E_TEST_NO_FN, "Missing test function") |\n| ERRORS.E_TEST_EXPECT | Test expectation failed | createError(ERRORS.E_TEST_EXPECT, "Expected value does not match") |\n| ERRORS.E_TEST_BEFORE | Before hook failed | createError(ERRORS.E_TEST_BEFORE, "Setup hook threw error") |\n| ERRORS.E_TEST_AFTER | After hook failed | createError(ERRORS.E_TEST_AFTER, "Cleanup hook threw error") |\n| ERRORS.E_TEST_FN | Test function threw an error | createError(ERRORS.E_TEST_FN, "Test function crashed") |\n| ERRORS.E_NO_TESTS | No test suites found | createError(ERRORS.E_NO_TESTS, "No test files discovered") |\n| ERRORS.E_IMPORT | Failed to import a test file | createError(ERRORS.E_IMPORT, "Cannot resolve test file path") |\n| ERRORS.E_MAGIC_TEST | General test execution error | createError(ERRORS.E_MAGIC_TEST, "Internal test runner error") |',
  ),

  h2({}, 'Usage Example'),

  p('Create custom errors with specific codes and messages:'),

  Pre(`
import { createError, ERRORS } from '@magic/test'

export default [
  {
    fn: () => createError(ERRORS.E_TEST_NO_FN, 'Missing fn property'),
    expect: e => e.code === 'E_TEST_NO_FN' && e.message === 'Missing fn property',
    info: 'createError creates errors with code and message',
  },
]
`),

  h2({}, 'Error Object Properties'),

  ul([
    li('code - The error code string (e.g., "E_TEST_NO_FN")'),
    li('message - Human-readable error message'),
    li('stack - Stack trace for debugging'),
  ]),

  p('See also: '),
  [Link({ to: '/error-codes/' }, 'Full Error Codes Reference')],
]