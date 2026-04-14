const key = `before-${new Date().getTime() + Math.random() * 1000}` as const

export default [
  {
    before: () => {
      ;(globalThis as Record<string, unknown>)[key] = 'before'
      return () => delete (globalThis as Record<string, unknown>)[key]
    },
    fn: () => (globalThis as Record<string, unknown>)[key],
    expect: 'before',
    info: 'globalThis.before should be before',
  },
  {
    before: () => {
      ;(globalThis as Record<string, unknown>)[key] = 'test_value'
      return () => {
        const wasDeleted = (globalThis as Record<string, unknown>)[key] === undefined
        delete (globalThis as Record<string, unknown>)[key]
        return wasDeleted
      }
    },
    fn: () => (globalThis as Record<string, unknown>)[key],
    expect: 'test_value',
    info: 'before sets value, fn runs before cleanup',
  },
  {
    before: () => {
      ;(globalThis as Record<string, unknown>)[key] = 'cleanup_test'
      return () => delete (globalThis as Record<string, unknown>)[key]
    },
    fn: () => {
      const beforeValue = (globalThis as Record<string, unknown>)[key]
      return beforeValue
    },
    expect: 'cleanup_test',
    info: 'test can read value set by before',
  },
  {
    fn: () => (globalThis as Record<string, unknown>)[key],
    expect: undefined,
    info: 'globalThis[key] is undefined when not set by before',
  },
]
