import { handleWorkerError } from '#src/run/lib/handleWorkerError.js'
import { has } from '#lib/has.js'
import type { TestResult, TestCase } from '#src/types.js'

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
      return result
    },
    expect: has.properties({ pass: false, name: 'test-name' }),
    info: 'returns fail result with test name',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const error = new Error('test error')
      const test = createTest({ key: 'custom-key' })
      handleWorkerError(test, error, rawResults, silentErrorLog)
      return rawResults[0]?.key
    },
    expect: 'custom-key',
    info: 'pushes fail result to rawResults',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const error = new Error('specific error')
      const test = createTest()
      handleWorkerError(test, error, rawResults, silentErrorLog)
      return rawResults.length
    },
    expect: 1,
    info: 'adds exactly one result to rawResults',
  },
  {
    fn: () => {
      const rawResults: TestResult[] = []
      const test = createTest()
      const result = handleWorkerError(test, 'string error', rawResults, silentErrorLog)
      return result.pass
    },
    expect: false,
    info: 'handles non-Error argument',
  },
] satisfies TestCase[]
