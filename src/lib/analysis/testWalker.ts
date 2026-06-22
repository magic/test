import is from '@magic/types'
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
export const walkTests = (
  tests: TestCollection | TestObject | WrappedTest[],
  visitor: (test: WalkableTest) => boolean | void,
): boolean => {
  if (!tests) {
    return false
  }

  // Handle arrays
  if (is.array(tests)) {
    return (tests as WrappedTest[]).some(test => {
      if (visitor(test as WalkableTest) === true) {
        return true
      }
      if ((test as WalkableTest).tests) {
        return walkTests((test as WalkableTest).tests as TestCollection, visitor)
      }
      return false
    })
  }

  // Handle objects
  if (is.objectNative(tests)) {
    const obj = tests as WalkableTest

    // Visit top-level hooks
    if (visitor(obj) === true) {
      return true
    }

    // Recurse into nested collections
    if (obj.tests) {
      if (walkTests(obj.tests as TestCollection, visitor)) {
        return true
      }
    }
    if (obj.nested) {
      if (walkTests(obj.nested as TestCollection, visitor)) {
        return true
      }
    }

    // For TestCollectionObject, walk each key as potential suite
    if ('tests' in tests || 'nested' in tests) {
      // Already handled above
    } else {
      // Treat other keys as nested suites
      for (const [key, value] of Object.entries(tests)) {
        if (key === 'beforeAll' || key === 'afterAll' || key === 'fn') {
          continue
        }
        if (is.function(value)) {
          continue // Hooks handled by visitor
        }
        if (walkTests(value as TestCollection, visitor)) {
          return true
        }
      }
    }
  }

  return false
}
