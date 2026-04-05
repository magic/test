import { mount, html } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Toggle.svelte'

type TestCase = {
  component?: string
  props?: Record<string, unknown>
  fn: (ctx: { target: unknown; component?: unknown }) => unknown
  expect?: unknown
  info?: string
}

type TestCtx = {
  target: unknown
  component?: unknown
}

export default [
  {
    component,
    props: { label: 'Enable', initial: false },
    fn: async ({ target }: TestCtx) => {
      const result = html(target)
      return result.includes('Enable') && result.includes('OFF')
    },
    expect: true,
    info: 'renders toggle with label and initial state OFF',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ component: instance }: TestCtx) => (instance as { on: boolean }).on,
    expect: true,
    info: 'returns on state from component',
  },
  {
    component,
    props: { label: 'Enable', initial: true },
    fn: async ({ target }: TestCtx) => {
      const input = (target as HTMLElement).querySelector<HTMLInputElement>('input')!
      return input.checked
    },
    expect: true,
    info: 'input checked property reflects initial state',
  },
  {
    fn: async () => {
      try {
        await mount(component, { props: 'invalid' } as unknown as {
          props?: Record<string, unknown>
        })
        return 'no error'
      } catch (e) {
        return (e as Error).message
      }
    },
    expect: 'Props must be an object, got string',
    info: 'throws when props is a string',
  },
] satisfies TestCase[]
