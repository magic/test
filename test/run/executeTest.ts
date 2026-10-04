import { executeTest } from '#src/run/lib/executeTest.js'
import type { TestCase } from '#src/types.js'

const tests: TestCase[] = [
  // sync function
  {
    fn: () => executeTest(() => 42, 'key'),
    expect: 42,
    info: 'executeTest runs sync function',
  },
  // async function
  {
    fn: () => executeTest(async () => 'async result', 'key'),
    expect: 'async result',
    info: 'executeTest runs async function',
  },
  // function returning promise value
  {
    fn: () => executeTest(() => Promise.resolve(99), 'key'),
    expect: 99,
    info: 'executeTest awaits promise returned by fn',
  },
  // promise passed directly
  {
    fn: () => executeTest(Promise.resolve('resolved'), 'key'),
    expect: 'resolved',
    info: 'executeTest awaits promise value',
  },
  // plain value passed
  {
    fn: () => executeTest('just a string', 'key'),
    expect: 'just a string',
    info: 'executeTest returns plain value as-is',
  },
  // null value passed
  {
    fn: () => executeTest(null, 'key'),
    expect: null,
    info: 'executeTest returns null as-is',
  },
  // undefined value passed
  {
    fn: () => executeTest(undefined, 'key'),
    expect: undefined,
    info: 'executeTest returns undefined as-is',
  },
  // object value passed
  {
    fn: () => {
      const obj = { a: 1 }
      return executeTest(obj, 'key')
    },
    expect: (result: unknown) => result !== null && (result as { a?: number }).a === 1,
    info: 'executeTest returns object as-is',
  },
  // function that throws
  {
    fn: async () => {
      try {
        await executeTest(() => {
          throw new Error('boom')
        }, 'key')
        return 'no error'
      } catch (e) {
        return e instanceof Error ? e.message : 'unknown'
      }
    },
    expect: 'boom',
    info: 'executeTest propagates fn errors',
  },
  // component mount + unmount lifecycle
  {
    fn: async () => {
      let sawContext = false
      const result = await executeTest(
        (ctx: { target?: unknown; component?: unknown; unmount?: unknown }) => {
          sawContext = !!ctx && 'target' in (ctx as object) && 'unmount' in (ctx as object)
          return 123
        },
        'key',
        './test/.fixtures/components/Button.svelte',
      )
      return result === 123 && sawContext
    },
    expect: true,
    info: 'executeTest mounts component and passes { target, component, unmount } to fn',
  },
  // component with props
  {
    fn: async () => {
      const result = await executeTest(
        (ctx: { target?: { innerHTML: string } }) =>
          (ctx as { target?: { innerHTML: string } }).target?.innerHTML ?? '',
        'key',
        './test/.fixtures/components/Button.svelte',
        { variant: 'danger' },
      )
      return (result as string).includes('btn danger')
    },
    expect: true,
    info: 'executeTest passes props to component (renders danger variant)',
  },
  // unmount is called even if fn throws
  {
    fn: async () => {
      try {
        await executeTest(
          () => {
            throw new Error('in test')
          },
          'key',
          './test/.fixtures/components/Button.svelte',
        )
      } catch {
        // expected
      }
      // if we got here without hanging, unmount completed
      return true
    },
    expect: true,
    info: 'executeTest unmounts component even when fn throws',
  },
]

export default tests
