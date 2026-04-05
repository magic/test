import is from '@magic/types'
import { env } from '../../src/index.js'

export default [
  {
    fn: env.isNodeProd,
    expect: process.env.NODE_ENV === 'production',
    info: 'env.isNodeProd equals NODE_ENV',
  },
  {
    fn: env.isProd,
    expect: process.argv.includes('-p'),
    info: 'isProd is equal to process.argv args',
  },
  {
    fn: env.isVerbose,
    expect: process.argv.includes('--verbose'),
    info: 'isVerbose is equal to process.argv args',
  },
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      delete process.env.MAGIC_TEST_ERROR_LENGTH
      const result = env.getErrorLength()
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: undefined,
    info: 'getErrorLength returns undefined when env not set and not verbose',
  },
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      process.env.MAGIC_TEST_ERROR_LENGTH = '100'
      const result = env.getErrorLength()
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: 100,
    info: 'getErrorLength returns parsed env value',
  },
  {
    fn: () => {
      const original = process.env.MAGIC_TEST_ERROR_LENGTH
      process.env.MAGIC_TEST_ERROR_LENGTH = '0'
      const result = env.getErrorLength()
      process.env.MAGIC_TEST_ERROR_LENGTH = original
      return result
    },
    expect: 0,
    info: 'getErrorLength returns 0 when env is 0 (no limit)',
  },
]
