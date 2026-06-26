export const View = state => [
  h1({ id: 'error-codes' }, 'Error Codes'),

  p([
    '@magic/test uses error codes to help with debugging and programmatic error handling.',
    ' You can import these constants from `@magic/test`:',
  ]),

  Pre(`
import { ERRORS, createError } from '@magic/test'
`),

  h2({}, 'Available Error Codes'),

  p('| Code | Description |'),
  p('| ---- | ----------- |'),
  p('| ERRORS.E_EMPTY_SUITE | Test suite is not exporting any tests |'),
  p('| ERRORS.E_RUN_SUITE_UNKNOWN | Unknown error occurred while running a suite |'),
  p('| ERRORS.E_TEST_NO_FN | Test object is missing the `fn` property |'),
  p('| ERRORS.E_TEST_EXPECT | Test expectation failed |'),
  p('| ERRORS.E_TEST_BEFORE | Before hook failed |'),
  p('| ERRORS.E_TEST_AFTER | After hook failed |'),
  p('| ERRORS.E_TEST_FN | Test function threw an error |'),
  p('| ERRORS.E_NO_TESTS | No test suites found |'),
  p('| ERRORS.E_IMPORT | Failed to import a test file |'),
  p('| ERRORS.E_MAGIC_TEST | General test execution error |'),

  h2({}, 'createError'),

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

  h2({}, 'Usage Example'),

  Pre(`
try {
  // run tests
} catch (e) {
  if (e.code === ERRORS.E_TEST_NO_FN) {
    console.error('Test is missing fn property:', e.message)
  } else if (e.code === ERRORS.E_TEST_FN) {
    console.error('Test function threw an error:', e.message)
  } else if (e.code === ERRORS.E_IMPORT) {
    console.error('Failed to import test file:', e.message)
  }
}
`),

  h2({}, 'Error Object Properties'),

  ul([
    li('code - The error code string (e.g., "E_TEST_NO_FN")'),
    li('message - Human-readable error message'),
    li('stack - Stack trace for debugging'),
  ]),
]
