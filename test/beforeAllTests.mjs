// This test can not make sure that both afterAll functions actually get executed.
export default {
  beforeAll: () => {
    global.beforeAll = 'beforeAll'
    global.testing = true
    return () => {
      global.afterAllInBeforeAll = 'afterAll in beforeAll'
      global.testing = 'afterAll'
    }
  },
  afterAll: () => {
    if (global.testing !== 'afterAll') {
      console.error(`AfterAll global.testing not matching ${global.testing} expected: 'afterAll'`)
    }
  },
  tests: [
    {
      fn: () => global.testing,
      expect: true,
      info: 'BeforeAll handler sets global true',
    },
    {
      fn: () => global.logs,
      expect: undefined,
      info: 'Undefined globals are undefined and not true',
    },
  ],
}
