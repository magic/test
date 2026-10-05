import { test } from '#src/lib/stats/test.js'
import { createStore } from '#src/lib/store.js'
import type { Test, TestResults } from '#src/types.js'

export default [
  // Test basic passing with no parent/pkg
  {
    fn: () => {
      const store = createStore()
      test({ name: 'test1', pass: true }, store)
      const results = store.get<TestResults>('results')
      return results?.test1?.all === 1 && results?.test1?.pass === 1
    },
    expect: true,
    info: 'test with no parent/pkg updates test1',
  },
  // Test basic failing with no parent/pkg
  {
    fn: () => {
      const store = createStore()
      test({ name: 'test2', pass: false }, store)
      const results = store.get<TestResults>('results')
      return results?.test2?.all === 1 && results?.test2?.pass === 0
    },
    expect: true,
    info: 'test with no parent/pkg - fail case',
  },
  // Test with parent - creates parent entry
  {
    fn: () => {
      const store = createStore()
      test({ name: 'child', parent: 'parent', pass: true }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      if (results.parent?.all !== 1 || results.parent?.pass !== 1) {
        return false
      }
      if (!results['parent.child']) {
        return false
      }
      return results['parent.child'].all === 1 && results['parent.child'].pass === 1
    },
    expect: true,
    info: 'test with parent creates parent and child entries',
  },
  // Test with parent - failing
  {
    fn: () => {
      const store = createStore()
      test({ name: 'child', parent: 'parent', pass: false }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      return results.parent?.all === 1 && results.parent?.pass === 0
    },
    expect: true,
    info: 'test with parent - failing case',
  },
  // Test with pkg - creates pkg entry
  {
    fn: () => {
      const store = createStore()
      test({ name: 'test', pkg: 'pkg', pass: true }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      if (results.pkg?.all !== 1 || results.pkg?.pass !== 1) {
        return false
      }
      return !!results['pkg.test'] && results['pkg.test'].all === 1
    },
    expect: true,
    info: 'test with pkg creates pkg and test entries',
  },
  // Test with parent and pkg (different)
  {
    fn: () => {
      const store = createStore()
      test({ name: 'test', parent: 'parent', pkg: 'pkg', pass: true }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      return (
        results.parent?.all === 1 &&
        results.pkg?.all === 1 &&
        !!results['pkg.parent.test'] &&
        results['pkg.parent.test'].all === 1
      )
    },
    expect: true,
    info: 'test with parent and pkg creates all entries',
  },
  // Test __PACKAGE_ROOT__ is updated
  {
    fn: () => {
      const store = createStore()
      test({ name: 'test1', pass: true }, store)
      test({ name: 'test2', pass: false }, store)
      const results = store.get<TestResults>('results')
      if (!results || !results.__PACKAGE_ROOT__) {
        return false
      }
      return results.__PACKAGE_ROOT__.all === 2 && results.__PACKAGE_ROOT__.pass === 1
    },
    expect: true,
    info: '__PACKAGE_ROOT__ tracks total tests and passes',
  },
  // Test empty/null parent
  {
    fn: () => {
      const store = createStore()
      test({ name: 'mytest', parent: '', pass: true }, store)
      const results = store.get<TestResults>('results')
      return results?.mytest?.all === 1 && results?.mytest?.pass === 1
    },
    expect: true,
    info: 'test with empty parent works',
  },
  // Test null/undefined parent
  {
    fn: () => {
      const store = createStore()
      test({ name: 'mytest', parent: null as unknown as string, pass: true }, store)
      const results = store.get<TestResults>('results')
      return results?.mytest?.all === 1 && results?.mytest?.pass === 1
    },
    expect: true,
    info: 'test with null parent works',
  },
  // Test pkg equals parent - parent entry is created (as parent, same key as pkg)
  {
    fn: () => {
      const store = createStore()
      test({ name: 'mytest', parent: 'pkg', pkg: 'pkg', pass: true }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      const entry = results['pkg.mytest']
      if (!entry) {
        return false
      }
      return entry.all === 1 && entry.pass === 1 && !!results.pkg && results.pkg?.all === 1
    },
    expect: true,
    info: 'test with pkg===parent creates parent entry under same key',
  },
  // Test multiple tests in same suite
  {
    fn: () => {
      const store = createStore()
      test({ name: 't1', parent: 'suite', pass: true }, store)
      test({ name: 't2', parent: 'suite', pass: false }, store)
      test({ name: 't3', parent: 'suite', pass: true }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      if (!results.suite) {
        return false
      }
      return results.suite.all === 3 && results.suite.pass === 2
    },
    expect: true,
    info: 'multiple tests in same suite aggregate stats',
  },
  // Test multiple test suites
  {
    fn: () => {
      const store = createStore()
      test({ name: 't1', parent: 'suite1', pass: true }, store)
      test({ name: 't2', parent: 'suite2', pass: false }, store)
      const results = store.get<TestResults>('results')
      if (!results) {
        return false
      }
      return (
        results.suite1?.all === 1 &&
        results.suite1?.pass === 1 &&
        results.suite2?.all === 1 &&
        results.suite2?.pass === 0
      )
    },
    expect: true,
    info: 'multiple test suites independent stats',
  },
] satisfies Test[]
