import { Store } from '../store.ts'

import type { TestResults } from '../../types.ts'

/**
 * Record a test result in the store, updating statistics for the test,
 * its parent, package, and global counters.
 */
export const test = (
  t: { name: string; parent?: string; pass: boolean; pkg?: string },
  store: Store,
): void => {
  const storeResults = store.get('results')
  const results: TestResults = (storeResults as TestResults | undefined) ?? {
    __PACKAGE_ROOT__: { all: 0, pass: 0 },
  }

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

  results.__PACKAGE_ROOT__!.all++
  results[currentName]!.all++
  if (pass) {
    results.__PACKAGE_ROOT__!.pass++
    results[currentName]!.pass++
  }

  store.set({ results })
}
