import { html } from '../../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/testFixtures/components/ListItem.svelte'

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
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: { target: unknown; component?: unknown }) =>
      html(target).includes('class="list-item"'),
    expect: true,
    info: 'renders list item with class',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: { target: unknown; component?: unknown }) =>
      html(target).includes('Test Item'),
    expect: true,
    info: 'renders item text',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: { target: unknown; component?: unknown }) => {
      const text = (target as HTMLElement).querySelector('.item-text')
      return text && text.textContent === 'Test Item'
    },
    expect: true,
    info: 'renders item text in span',
  },
  {
    component,
    props: { item: { text: 'With Remove' } },
    fn: ({ target }: { target: unknown; component?: unknown }) =>
      html(target).includes('remove-btn'),
    expect: false,
    info: 'does not render remove button when onRemove not provided',
  },
  {
    component,
    props: { item: { text: 'With Remove' }, onRemove: () => {} },
    fn: ({ target }: { target: unknown; component?: unknown }) =>
      html(target).includes('remove-btn'),
    expect: true,
    info: 'renders remove button when onRemove is provided',
  },
  {
    component,
    props: { item: { text: 'Click Test' }, onRemove: () => {} },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      const btn = (target as HTMLElement).querySelector('.remove-btn')
      return btn !== null
    },
    expect: true,
    info: 'remove button exists when onRemove is provided',
  },
  {
    component,
    props: { item: { text: '' } },
    fn: ({ target }: { target: unknown; component?: unknown }) => {
      const text = (target as HTMLElement).querySelector('.item-text')
      return text && text.textContent === ''
    },
    expect: true,
    info: 'renders empty text',
  },
  {
    component,
    props: { item: { text: 'Long Text Here' } },
    fn: ({ target }: { target: unknown; component?: unknown }) =>
      html(target).includes('Long Text Here'),
    expect: true,
    info: 'renders long item text',
  },
] satisfies TestCase[]
