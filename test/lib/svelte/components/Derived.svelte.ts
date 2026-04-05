import { mount, html } from '../../../../src/lib/svelte/index.js'
import { tryCatch } from '../../../../src/index.js'

const component = './src/lib/svelte/components/Derived.svelte'

type TestCase = {
  component?: string
  props?: Record<string, unknown>
  fn: (ctx: { target: unknown; component?: unknown }) => unknown
  expect?: unknown
  info?: string
}

export default [
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      const result = html(target)
      return result.includes('Count: 3') && result.includes('Double: 6')
    },
    expect: true,
    info: 'renders derived values',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { isEmpty: boolean }).isEmpty
    },
    expect: false,
    info: 'isEmpty is false when items exist',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { isEmpty: boolean }).isEmpty
    },
    expect: true,
    info: 'isEmpty is true when no items',
  },
  {
    fn: () => tryCatch(mount as (...args: unknown[]) => unknown, component, { props: null }),
    expect: (t: unknown) => (t as Error).message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const addButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.add')!
      addButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 4,
    info: 'add button increments count',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const removeButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.remove')!
      removeButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 2,
    info: 'remove button decrements count',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6] },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { isLarge: boolean }).isLarge
    },
    expect: true,
    info: 'isLarge is true when count > 5',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { isLarge: boolean }).isLarge
    },
    expect: false,
    info: 'isLarge is false when count <= 5',
  },
  {
    component,
    props: { items: [1, 2] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('Double: 4')
    },
    expect: true,
    info: 'renders doubleCount value',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('Double: 0')
    },
    expect: true,
    info: 'renders doubleCount as 0 for empty items',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('Count: 0')
    },
    expect: true,
    info: 'renders count as 0 for empty items',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('empty')
    },
    expect: true,
    info: 'renders empty text when isEmpty is true',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('has items')
    },
    expect: true,
    info: 'renders has items text when isEmpty is false',
  },
  {
    component,
    props: { items: [1, 2, 3, 4, 5, 6] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('large')
    },
    expect: true,
    info: 'renders large text when isLarge is true',
  },
  {
    component,
    props: { items: [1, 2, 3] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('small')
    },
    expect: true,
    info: 'renders small text when isLarge is false',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const removeButton = (target as HTMLElement).querySelector<HTMLButtonElement>('.remove')!
      removeButton.click()
      await new Promise(r => setTimeout(r, 10))
      return (instance as { count: number }).count
    },
    expect: 0,
    info: 'remove button does not go below 0 when count is 0',
  },
] satisfies TestCase[]
