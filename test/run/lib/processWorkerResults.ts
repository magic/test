import is from '@magic/types'
import { processWorkerResults } from '../../../src/run/lib/processWorkerResults.js'
import type { TestResult } from '../../../src/types.js'
import type { TestCase } from '../../../src/types.js'

const createResult = (overrides: Partial<TestResult> = {}): TestResult => ({
  result: undefined,
  msg: '',
  pass: true,
  parent: '',
  name: 'test',
  expect: undefined,
  expString: undefined,
  key: 'key',
  pkg: 'pkg',
  ...overrides,
})

const silentLogger = (..._msgs: unknown[]) => true

export default [
  {
    fn: () => {
      const results: TestResult[] = []
      const rawResults: TestResult[] = []
      return processWorkerResults(results, rawResults, silentLogger)
    },
    expect: [],
    info: 'returns empty results when none provided',
  },
  {
    fn: () => {
      const results = [createResult({ name: 'test1' }), createResult({ name: 'test2' })]
      const rawResults: TestResult[] = []
      processWorkerResults(results, rawResults, silentLogger)
      return rawResults.length === 2
    },
    expect: true,
    info: 'pushes all results to rawResults',
  },
  {
    fn: () => {
      const results = [createResult({ name: 'test1' })]
      const rawResults: TestResult[] = []
      processWorkerResults(results, rawResults, silentLogger)
      return rawResults[0]?.name === 'test1'
    },
    expect: true,
    info: 'preserves result order in rawResults',
  },
  {
    fn: () => {
      const results = [
        createResult({ afterCleanupError: 'error1' }),
        createResult({ afterError: 'error2' }),
      ]
      const rawResults: TestResult[] = []
      return processWorkerResults(results, rawResults, silentLogger)
    },
    expect: is.len.eq(2),
    info: 'handles results with afterCleanupError and afterError',
  },
] satisfies TestCase[]
