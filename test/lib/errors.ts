import is from '@magic/types'
import { ERRORS, ERROR_MESSAGES, createError } from '../../src/lib/errors.js'
import type { TestCase } from '../../src/types.js'

export default [
  // ERRORS object contains expected codes
  {
    fn: () => 'E_EMPTY_SUITE' in ERRORS,
    expect: true,
    info: 'ERRORS contains E_EMPTY_SUITE',
  },
  {
    fn: () => 'E_TEST_NO_FN' in ERRORS,
    expect: true,
    info: 'ERRORS contains E_TEST_NO_FN',
  },
  {
    fn: () => 'E_NO_TESTS' in ERRORS,
    expect: true,
    info: 'ERRORS contains E_NO_TESTS',
  },
  // ERROR_MESSAGES
  {
    fn: () => ERROR_MESSAGES.E_EMPTY_SUITE,
    expect: is.function,
    info: 'E_EMPTY_SUITE is a function',
  },
  {
    fn: () => ERROR_MESSAGES.E_EMPTY_SUITE('test'),
    expect: 'test is not exporting tests.',
    info: 'E_EMPTY_SUITE generates correct message',
  },
  // createError
  {
    fn: () => {
      const err = createError('E_TEST', 'Test error message')
      return err
    },
    expect: is.error,
    info: 'createError returns instanceof Error',
  },
  {
    fn: () => {
      const err = createError('E_TEST', 'Test error message')
      return err.code
    },
    expect: 'E_TEST',
    info: 'createError sets code property',
  },
  {
    fn: () => {
      const err = createError('E_TEST', 'Test error message')
      return err.message
    },
    expect: 'Test error message',
    info: 'createError sets message property',
  },
  // ERROR_MESSAGES functions
  {
    fn: () => ERROR_MESSAGES.E_NO_TESTS,
    expect: 'No test suites found.',
    info: 'E_NO_TESTS returns string',
  },
  {
    fn: () => ERROR_MESSAGES.E_TEST_NO_FN('myTest'),
    expect: 'test.fn is not a function in myTest',
    info: 'E_TEST_NO_FN generates correct message',
  },
  {
    fn: () => {
      const err = new Error('inner')
      return ERROR_MESSAGES.E_TEST_EXPECT('myTest', err).includes('myTest')
    },
    expect: true,
    info: 'E_TEST_EXPECT includes test name',
  },
  {
    fn: () => {
      const err = new Error('hook failed')
      return ERROR_MESSAGES.E_TEST_BEFORE('myTest', err).includes('hook failed')
    },
    expect: true,
    info: 'E_TEST_BEFORE includes error',
  },
  {
    fn: () => {
      const err = new Error('beforeEach failed')
      return ERROR_MESSAGES.E_TEST_BEFORE_EACH('myTest', err).includes('beforeEach failed')
    },
    expect: true,
    info: 'E_TEST_BEFORE_EACH generates correct message',
  },
  {
    fn: () => {
      const err = new Error('after failed')
      return ERROR_MESSAGES.E_TEST_AFTER('myTest', err).includes('after failed')
    },
    expect: true,
    info: 'E_TEST_AFTER generates correct message',
  },
  {
    fn: () => {
      const err = new Error('afterEach failed')
      return ERROR_MESSAGES.E_TEST_AFTER_EACH('myTest', err).includes('afterEach failed')
    },
    expect: true,
    info: 'E_TEST_AFTER_EACH generates correct message',
  },
  {
    fn: () => {
      const err = new Error('fn failed')
      return ERROR_MESSAGES.E_TEST_FN('myTest', err).includes('fn failed')
    },
    expect: true,
    info: 'E_TEST_FN generates correct message',
  },
  {
    fn: () => ERROR_MESSAGES.E_IMPORT('module.js'),
    expect: 'Failed to import: module.js',
    info: 'E_IMPORT generates correct message',
  },
] satisfies TestCase[]
