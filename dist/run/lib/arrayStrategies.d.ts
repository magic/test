import type { Suite, Snapshot, TestResult, TestObject, Test } from '../../types.js'
import type { Store } from '../../lib/store.js'
type BaseStrategyArgs = {
  tests: Test[]
  name: string
  parent: string
  pkg: string
  store: Store
  rawResults: TestResult[]
  suiteObj?: TestObject
}
type IsolatedStrategyArgs = BaseStrategyArgs & {
  testFileUrl: string
  suiteSnapshot?: Snapshot
  hasBeforeAll: boolean
}
/**
 * Isolated execution: tests modify globals / imported module state / fixed
 * ports or files, so each runs in its own worker (fresh globalThis + module
 * imports). When the suite has a beforeAll, the unhooked tests are batched
 * into a single worker; otherwise they run in parallel on the main thread.
 * Hooked tests always get individual workers.
 */
export declare const runIsolatedArray: (
  args: IsolatedStrategyArgs,
) => Promise<(TestResult | Suite)[]>
/**
 * Sequential execution with per-test hooks: the suite has beforeEach or
 * afterEach, so tests must run one at a time on the main thread to preserve
 * hook ordering.
 */
export declare const runSequentialHooked: (
  args: BaseStrategyArgs,
) => Promise<(TestResult | Suite)[]>
/**
 * Plain parallel execution: no isolation or hooks involved.
 */
export declare const runParallelArray: (
  args: Pick<BaseStrategyArgs, 'tests' | 'name' | 'parent' | 'pkg' | 'store' | 'rawResults'>,
) => Promise<(TestResult | Suite)[]>
export {}
