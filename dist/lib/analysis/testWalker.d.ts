import type { TestCollection, TestObject, WrappedTest } from '../../types.ts'
interface WalkableTest {
  before?: unknown
  after?: unknown
  fn?: unknown
  tests?: unknown
  beforeEach?: unknown
  afterEach?: unknown
  beforeAll?: unknown
  afterAll?: unknown
  nested?: unknown
}
/**
 * Walk test structure recursively, calling visitor on each test.
 * Return true from visitor to stop walking (early exit).
 */
export declare const walkTests: (
  tests: TestCollection | TestObject | WrappedTest[],
  visitor: (test: WalkableTest) => boolean | void,
) => boolean
export {}
