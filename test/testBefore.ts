const key = `before-${new Date().getTime() + Math.random() * 1000}`

export default [
  {
    before: () => {
      ;(globalThis as any)[key] = 'before'
      return () => delete (globalThis as any)[key]
    },
    fn: () => (globalThis as any)[key],
    expect: 'before',
    info: 'globalThis.before should be before',
  },
  {
    before: () => {
      ;(globalThis as any)[key] = 'test_value'
      return () => {
        const wasDeleted = (globalThis as any)[key] === undefined
        delete (globalThis as any)[key]
        return wasDeleted
      }
    },
    fn: () => (globalThis as any)[key],
    expect: 'test_value',
    info: 'before sets value, fn runs before cleanup',
  },
  {
    before: () => {
      ;(globalThis as any)[key] = 'cleanup_test'
      return () => delete (globalThis as any)[key]
    },
    fn: () => {
      const beforeValue = (globalThis as any)[key]
      return beforeValue
    },
    expect: 'cleanup_test',
    info: 'test can read value set by before',
  },
  {
    fn: () => (globalThis as any)[key],
    expect: undefined,
    info: 'globalThis[key] is undefined when not set by before',
  },
]
