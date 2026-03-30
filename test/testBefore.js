const key = `before-${new Date().getTime() + Math.random() * 1000}`

export default [
  {
    before: () => {
      globalThis[key] = 'before'
      return () => delete globalThis[key]
    },
    fn: () => globalThis[key],
    expect: 'before',
    info: 'globalThis.before should be before',
  },
  {
    before: () => {
      globalThis[key] = 'test_value'
      return () => {
        const wasDeleted = globalThis[key] === undefined
        delete globalThis[key]
        return wasDeleted
      }
    },
    fn: () => globalThis[key],
    expect: 'test_value',
    info: 'before sets value, fn runs before cleanup',
  },
  {
    before: () => {
      globalThis[key] = 'cleanup_test'
      return () => delete globalThis[key]
    },
    fn: () => {
      const beforeValue = globalThis[key]
      return beforeValue
    },
    expect: 'cleanup_test',
    info: 'test can read value set by before',
  },
  {
    fn: () => globalThis[key],
    expect: undefined,
    info: 'globalThis[key] is undefined when not set by before',
  },
]
