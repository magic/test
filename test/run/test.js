import { runTest } from '../../src/run/test.js'

export default [
  {
    name: 'runTest delegates to runSuite when tests exists but no fn',
    fn: async () => {
      const result = await runTest({
        name: 'nested',
        parent: 'run-test-delegate',
        pkg: 'run-test-pkg',
        tests: { child: [{ fn: true, expect: true }] },
      })
      return result && result.tests && result.tests.length > 0
    },
    expect: true,
  },
  {
    name: 'runTest returns pass=true for passing test',
    fn: async () => {
      const result = await runTest({
        name: 'passing-test',
        parent: 'run-test-pass',
        pkg: 'run-test-pkg',
        fn: () => 'result',
        expect: 'result',
      })
      return result && result.pass === true
    },
    expect: true,
  },
  {
    name: 'runTest handles test with is property instead of expect',
    fn: async () => {
      const result = await runTest({
        name: 'is-test',
        parent: 'run-test-is',
        pkg: 'run-test-pkg',
        fn: () => true,
        is: true,
      })
      return result && result.pass === true
    },
    expect: true,
  },
  {
    name: 'runTest defaults expect to true when neither expect nor is provided',
    fn: async () => {
      const result = await runTest({
        name: 'default-expect-test',
        parent: 'run-test-default',
        pkg: 'run-test-pkg',
        fn: () => true,
      })
      return result && result.pass === true
    },
    expect: true,
  },
  {
    name: 'runTest handles expect as function that returns true',
    fn: async () => {
      const result = await runTest({
        name: 'expect-fn-test',
        parent: 'run-test-fn',
        pkg: 'run-test-pkg',
        fn: () => 'value',
        expect: res => res === 'value',
      })
      return result && result.pass === true
    },
    expect: true,
  },
  {
    name: 'runTest handles before hook that returns cleanup function',
    fn: async () => {
      let cleanupCalled = false
      const result = await runTest({
        name: 'before-cleanup-test',
        parent: 'run-test-before',
        pkg: 'run-test-pkg3',
        fn: () => true,
        expect: true,
        before: () => {
          return () => {
            cleanupCalled = true
          }
        },
      })
      return result && result.pass === true && cleanupCalled === true
    },
    expect: true,
  },
  {
    name: 'runTest handles after hook',
    fn: async () => {
      let afterCalled = false
      const result = await runTest({
        name: 'after-hook-test',
        parent: 'run-test-after',
        pkg: 'run-test-pkg4',
        fn: () => true,
        expect: true,
        after: () => {
          afterCalled = true
        },
      })
      return result && result.pass === true && afterCalled === true
    },
    expect: true,
  },

  {
    name: 'runTest handles info property in result',
    fn: async () => {
      const result = await runTest({
        name: 'info-test',
        parent: 'run-test-info',
        pkg: 'run-test-pkg7',
        fn: () => true,
        expect: true,
        info: 'test info message',
      })
      return result && result.info === 'test info message'
    },
    expect: true,
  },
  {
    name: 'runTest returns result object with expected value',
    fn: async () => {
      const result = await runTest({
        name: 'result-test',
        parent: 'run-test-result',
        pkg: 'run-test-pkg8',
        fn: () => 'actual',
        expect: 'actual',
      })
      return result && result.result === 'actual'
    },
    expect: true,
  },
]
