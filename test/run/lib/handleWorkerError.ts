import { handleWorkerError } from '../../../src/run/lib/handleWorkerError.js'
import type { TestResult } from '../../../src/types.js'
import type { TestCase } from '../../../src/types.js'

const createTest = (overrides = {}): Parameters<typeof handleWorkerError>[0] => ({
  name: 'test-name',
  pkg: 'test-pkg',
  parent: 'test-parent',
  key: 'test-key',
  ...overrides,
})

const silentErrorLog = (_error: string | Error, ..._msg: unknown[]) => true

export default [
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const error = new Error('test error')
      const test = createTest()
      const result = handleWorkerError(test, error, rawResults, silentErrorLog)
      return result.pass === false && result.name === 'test-name'
    },
    expect: true,
    info: 'returns fail result with test name',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const error = new Error('test error')
      const test = createTest({ key: 'custom-key' })
      handleWorkerError(test, error, rawResults, silentErrorLog)
      return rawResults[0]?.key === 'custom-key'
    },
    expect: true,
    info: 'pushes fail result to rawResults',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const error = new Error('specific error')
      const test = createTest()
      handleWorkerError(test, error, rawResults, silentErrorLog)
      return rawResults.length === 1
    },
    expect: true,
    info: 'adds exactly one result to rawResults',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const test = createTest()
      const result = handleWorkerError(test, 'string error', rawResults, silentErrorLog)
      return result.pass === false
    },
    expect: true,
    info: 'handles non-Error argument',
  },
] satisfies TestCase[]
