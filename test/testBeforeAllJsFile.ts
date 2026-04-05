import log from '@magic/log'

export default {
  beforeAll: () => {
    ;(globalThis as any).beforeAll = 'beforeAll'
    ;(globalThis as any).testing = true

    return () => {
      ;(globalThis as any).testing = 'afterAll'
    }
  },
  afterAll: () => {
    if ((globalThis as any).testing !== 'afterAll') {
      log.error(
        `AfterAll globalThis.testing not matching, is "${(globalThis as any).testing}" expected: 'afterAll'`,
      )
    }
  },
  tests: [
    {
      fn: () => (globalThis as any).testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => (globalThis as any).logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
    {
      fn: () => (globalThis as any).before,
      expect: true,
      info: 'test/beforeAll.js file gets executed before other tests.',
    },
  ],
}
