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
    fn: () => globalThis[key],
    expect: undefined,
    info: 'globalThis.before should be undefined',
  },
]
