import { ERRORS, ERROR_MESSAGES, createError, errorify } from '../../src/lib/index.js'

export default [
  // ERRORS constant
  {
    fn: () => ERRORS.E_EMPTY_SUITE,
    expect: 'E_EMPTY_SUITE',
    info: 'E_EMPTY_SUITE error code exists',
  },
  {
    fn: () => ERRORS.E_RUN_SUITE_UNKNOWN,
    expect: 'E_RUN_SUITE_UNKNOWN',
    info: 'E_RUN_SUITE_UNKNOWN error code exists',
  },
  {
    fn: () => ERRORS.E_TEST_NO_FN,
    expect: 'E_TEST_NO_FN',
    info: 'E_TEST_NO_FN error code exists',
  },
  {
    fn: () => ERRORS.E_TEST_EXPECT,
    expect: 'E_TEST_EXPECT',
    info: 'E_TEST_EXPECT error code exists',
  },
  {
    fn: () => ERRORS.E_TEST_BEFORE,
    expect: 'E_TEST_BEFORE',
    info: 'E_TEST_BEFORE error code exists',
  },
  {
    fn: () => ERRORS.E_TEST_AFTER,
    expect: 'E_TEST_AFTER',
    info: 'E_TEST_AFTER error code exists',
  },
  {
    fn: () => ERRORS.E_TEST_FN,
    expect: 'E_TEST_FN',
    info: 'E_TEST_FN error code exists',
  },
  {
    fn: () => ERRORS.E_NO_TESTS,
    expect: 'E_NO_TESTS',
    info: 'E_NO_TESTS error code exists',
  },
  {
    fn: () => ERRORS.E_IMPORT,
    expect: 'E_IMPORT',
    info: 'E_IMPORT error code exists',
  },
  {
    fn: () => ERRORS.E_MAGIC_TEST,
    expect: 'E_MAGIC_TEST',
    info: 'E_MAGIC_TEST error code exists',
  },
  // ERROR_MESSAGES
  {
    fn: () => ERROR_MESSAGES.E_NO_TESTS,
    expect: 'No test suites found.',
    info: 'E_NO_TESTS has correct message',
  },
  {
    fn: () => ERROR_MESSAGES.E_EMPTY_SUITE('myTest'),
    expect: 'myTest is not exporting tests.',
    info: 'E_EMPTY_SUITE message function works',
  },
  {
    fn: () => ERROR_MESSAGES.E_TEST_NO_FN('testKey'),
    expect: 'test.fn is not a function in testKey',
    info: 'E_TEST_NO_FN message function works',
  },
  // createError
  {
    fn: () => {
      const err = createError('E_TEST', 'test error message')
      return err.message
    },
    expect: 'test error message',
    info: 'createError sets message',
  },
  {
    fn: () => {
      const err = createError('E_TEST', 'test error message')
      return err.code
    },
    expect: 'E_TEST',
    info: 'createError sets code',
  },
  {
    fn: () => {
      const err = createError('E_TEST', 'test error message')
      return err instanceof Error
    },
    expect: true,
    info: 'createError returns Error instance',
  },
  // errorify
  {
    fn: () => {
      const err = errorify('E_NO_TESTS')
      return err.message
    },
    expect: 'No test suites found.',
    info: 'errorify with string message',
  },
  {
    fn: () => {
      const err = errorify('E_EMPTY_SUITE', 'mySuite')
      return err.message
    },
    expect: 'mySuite is not exporting tests.',
    info: 'errorify with function message',
  },
  {
    fn: () => {
      const err = errorify('UNKNOWN_CODE', 'some data')
      return err.message
    },
    expect: 'some data',
    info: 'errorify falls back to string data for unknown codes',
  },
  {
    fn: () => {
      const err = errorify('E_NO_TESTS')
      return err.code
    },
    expect: 'E_NO_TESTS',
    info: 'errorify sets error code',
  },
]
