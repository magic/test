const fn = n => n + 1

export default [
  {
    name: 'test0',
    fn: () => fn(1),
    expect: 2,
    info: 'basic add one',
  },
  {
    name: 'test1',
    fn: () => fn(5),
    expect: 6,
    info: 'add one to five',
  },
  {
    name: 'test2',
    fn: () => fn(globalThis.adder),
    expect: 2,
    info: 'add one to one',
    before: () => {
      globalThis.adder = 1
    },
  },
]
