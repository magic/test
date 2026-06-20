import { Store } from '../../../src/lib/store.js'
import { test } from '../../../src/lib/stats/test.js'
import type { TestCase } from '../../../src/types.js'

export default [
  // Basic test recording
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pass: true }, store)
      const results = store.get('results')
      return (results as Record<string, { all: number; pass: number }>)?.['test1']?.pass === 1
    },
    expect: true,
    info: 'records passing test',
  },
  // Failing test
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pass: false }, store)
      const results = store.get('results')
      return (results as Record<string, { all: number; pass: number }>)?.['test1']?.pass === 0
    },
    expect: true,
    info: 'records failing test',
  },
  // Increments all count
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pass: true }, store)
      const results = store.get('results')
      return (results as Record<string, { all: number }>)?.['test1']?.all === 1
    },
    expect: true,
    info: 'increments all count',
  },
  // With parent
  {
    fn: () => {
      const store = new Store()
      test({ name: 'child', parent: 'parent', pass: true }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results?.['parent.child']?.pass === 1 && results?.['parent']?.pass === 1
    },
    expect: true,
    info: 'records parent hierarchy',
  },
  // With pkg
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pkg: 'mypkg', pass: true }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results?.['mypkg.test1']?.pass === 1 && results?.['mypkg']?.pass === 1
    },
    expect: true,
    info: 'records package hierarchy',
  },
  // Multiple tests accumulate
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pass: true }, store)
      test({ name: 'test2', pass: false }, store)
      test({ name: 'test3', pass: true }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results?.['__PACKAGE_ROOT__']?.all === 3 && results?.['__PACKAGE_ROOT__']?.pass === 2
    },
    expect: true,
    info: 'multiple tests accumulate correctly',
  },
  // __PACKAGE_ROOT__ initialized
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pass: true }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return '__PACKAGE_ROOT__' in results
    },
    expect: true,
    info: 'initializes __PACKAGE_ROOT__',
  },
  // Parent increments all
  {
    fn: () => {
      const store = new Store()
      test({ name: 'child', parent: 'parent', pass: true }, store)
      test({ name: 'child2', parent: 'parent', pass: false }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results?.['parent']?.all === 2 && results?.['parent']?.pass === 1
    },
    expect: true,
    info: 'parent all count increments',
  },
  // pkg increments all
  {
    fn: () => {
      const store = new Store()
      test({ name: 'test1', pkg: 'mypkg', pass: true }, store)
      test({ name: 'test2', pkg: 'mypkg', pass: true }, store)
      const results = store.get('results') as Record<string, { all: number; pass: number }>
      return results?.['mypkg']?.all === 2 && results?.['mypkg']?.pass === 2
    },
    expect: true,
    info: 'pkg all count increments',
  },
] satisfies TestCase[]
