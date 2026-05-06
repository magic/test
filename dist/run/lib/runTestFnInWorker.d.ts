import type { WrappedTest } from '../../types.ts'
type RunFnResult = {
  result: unknown
  pass: boolean
  exp: unknown
  expString: unknown
  afterCleanupError: unknown
  afterError: unknown
}
export declare const runTestFnInWorker: (test: WrappedTest, key: string) => Promise<RunFnResult>
export {}
