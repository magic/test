import is from '@magic/types'
/**
 * Walk test structure recursively, calling visitor on each test.
 * Return true from visitor to stop walking (early exit).
 */
export const walkTests = (tests, visitor) => {
  if (!tests) {
    return false
  }
  // Handle arrays
  if (is.array(tests)) {
    return tests.some(test => {
      if (visitor(test) === true) {
        return true
      }
      if (test.tests) {
        return walkTests(test.tests, visitor)
      }
      return false
    })
  }
  // Handle objects
  if (is.objectNative(tests)) {
    const obj = tests
    // Visit top-level hooks
    if (visitor(obj) === true) {
      return true
    }
    // Recurse into nested collections
    if (obj.tests) {
      if (walkTests(obj.tests, visitor)) {
        return true
      }
    }
    if (obj.nested) {
      if (walkTests(obj.nested, visitor)) {
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
        if (walkTests(value, visitor)) {
          return true
        }
      }
    }
  }
  return false
}
