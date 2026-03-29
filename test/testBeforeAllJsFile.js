import log from '@magic/log'

// This test can not make sure that both afterAll functions actually get executed.
export default {
  beforeAll: () => {
    globalThis.beforeAll = 'beforeAll'
    globalThis.testing = true

    return () => {
      globalThis.testing = 'afterAll'
    }
  },
  afterAll: () => {
    if (globalThis.testing !== 'afterAll') {
      log.error(
        `AfterAll globalThis.testing not matching, is "${globalThis.testing}" expected: 'afterAll'`,
      )
    }
  },
  tests: [
    {
      fn: () => globalThis.testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => globalThis.logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
    {
      fn: () => globalThis.before,
      expect: true,
      info: 'test/beforeAll.js file gets executed before other tests.',
    },
  ],
}
