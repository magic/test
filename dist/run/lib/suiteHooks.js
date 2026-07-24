import is from '@magic/types'
/**
 * Check if beforeAll hook exists on tests.
 * Pure predicate.
 */
export const hasBeforeAll = tests => is.objectNative(tests) && is.function(tests.beforeAll)
/**
 * Check if afterEach hook exists on tests.
 * Pure predicate.
 */
export const hasAfterEach = tests => is.objectNative(tests) && is.function(tests.afterEach)
/**
 * Check if beforeEach hook exists on tests.
 * Pure predicate.
 */
export const hasBeforeEach = tests => is.objectNative(tests) && is.function(tests.beforeEach)
/**
 * Check if afterAll hook exists on tests.
 * Pure predicate.
 */
export const hasAfterAll = tests => is.objectNative(tests) && is.function(tests.afterAll)
