import { store } from '../store.js'

/**
 * @typedef {Object} TestStats
 * @property {number} all - Total number of tests
 * @property {number} pass - Number of passing tests
 */

/**
 * @typedef {Record<string, TestStats>} TestResults
 */

/**
 * @typedef {Object} PartialTest
 * @property {string} name
 * @property {string} [pkg]
 * @property {string} [parent]
 * @property {boolean} pass
 */

/**
 * Record a test result in the store, updating statistics for the test,
 * its parent, package, and global counters.
 *
 * @param {PartialTest} t - Test information to record
 *
 * @example
 * test({ name: 'myTest', parent: 'suite', pkg: 'mylib', pass: true })
 */
export const test = t => {
  /** @type {TestResults} */
  const results = store.get('results', {}) || {}

  const { name, parent, pass, pkg } = t

  let currentName = name

  if (parent && parent !== name) {
    currentName = `${parent}.${name}`

    if (!results[parent]) {
      results[parent] = { all: 0, pass: 0 }
    }
    results[parent].all++
    if (pass) {
      results[parent].pass++
    }
  }

  if (pkg && pkg !== parent) {
    currentName = `${pkg}.${currentName}`

    if (!results[pkg]) {
      results[pkg] = { all: 0, pass: 0 }
    }
    results[pkg].all++
    if (pass) {
      results[pkg].pass++
    }
  }

  if (!results[currentName]) {
    results[currentName] = { all: 0, pass: 0 }
  }
  if (!results.__PACKAGE_ROOT__) {
    results.__PACKAGE_ROOT__ = { all: 0, pass: 0 }
  }

  results.__PACKAGE_ROOT__.all++
  results[currentName].all++
  if (pass) {
    results.__PACKAGE_ROOT__.pass++
    results[currentName].pass++
  }

  store.set({ results })
}
