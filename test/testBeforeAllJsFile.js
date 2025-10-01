// This test can not make sure that both afterAll functions actually get executed.
export default {
  beforeAll: () => {
    globalThis.beforeAll = 'beforeAll'
    globalThis.testing = true
    return () => {
      globalThis.afterAllInBeforeAll = 'afterAll in beforeAll'
      globalThis.testing = 'afterAll'
    }
  },
  afterAll: () => {
    if (globalThis.testing !== 'afterAll') {
      console.error(
        `AfterAll globalThis.testing not matching ${globalThis.testing} expected: 'afterAll'`,
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
