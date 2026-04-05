import { html } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/CounterWithProps.svelte'

type TestCase = {
  component: string
  props?: Record<string, unknown>
  fn: (ctx: { target: unknown; component?: unknown }) => unknown
  expect?: unknown
  info?: string
}

export default [
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('10')
    },
    info: 'renders with initial value',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { count: number }).count
    },
    expect: 10,
    info: 'returns count from component',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const incButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.inc')!
      incButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 15,
    info: 'increment increases count by step',
  },
  {
    component,
    props: { initial: 10, step: 5 },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const decButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.dec')!
      decButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 5,
    info: 'decrement decreases count by step',
  },
  {
    component,
    props: { initial: 0, step: 10 },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const incButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.inc')!
      incButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 10,
    info: 'increment with step 10 adds 10',
  },
  {
    component,
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('+1') && html(target).includes('-1')
    },
    info: 'uses default step of 1',
  },
  {
    component,
    props: { step: 3 },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('+3') && html(target).includes('-3')
    },
    info: 'uses custom step value in button labels',
  },
  {
    component,
    props: { initial: 5 },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { count: number }).count === 5 && html(target).includes('5')
    },
    info: 'uses custom initial value',
  },
  {
    component,
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      return (
        html(target).includes('+1') &&
        html(target).includes('-1') &&
        (instance as { count: number }).count === 0
      )
    },
    info: 'uses default initial of 0 when not provided',
  },
] satisfies TestCase[]
