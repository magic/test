import { runTest } from '../../src/run/test.js'

export default [
  {
    name: 'runTest delegates to runSuite when tests exists but no fn',
    fn: async () => {
      const result = await runTest({
        name: 'nested',
        parent: 'test',
        pkg: 'test-pkg',
        tests: { child: [{ fn: true, expect: true }] },
      })
      return result && result.tests && result.tests.length > 0
    },
    expect: true,
  },
]
