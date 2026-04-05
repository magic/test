import { html, tick } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/List.svelte'

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
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
      ],
      title: 'My List',
    },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      const result = html(target)
      return result.includes('My List') && result.includes('Item 1') && result.includes('Item 2')
    },
    expect: true,
    info: 'renders list with items and title',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }], title: 'My List' },
    fn: async ({ component: instance }: { target: unknown; component?: unknown }) => {
      return (instance as { itemsList: unknown[] }).itemsList.length
    },
    expect: 1,
    info: 'returns itemsList from component',
  },
  {
    component,
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
      ],
    },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const removeButtons = (target as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.remove-btn',
      )
      removeButtons[0].click()
      await tick()
      return (instance as { itemsList: unknown[] }).itemsList.length
    },
    expect: 1,
    info: 'remove button removes item from list',
  },
  {
    component,
    props: { items: [] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('Total: 0')
    },
    expect: true,
    info: 'shows Total: 0 for empty list',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('Total: 1')
    },
    expect: true,
    info: 'shows correct total for list with items',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }] },
    fn: async ({ target }: { target: unknown; component?: unknown }) => {
      return html(target).includes('List')
    },
    expect: true,
    info: 'uses default title when not provided',
  },
  {
    component,
    props: {
      items: [
        { id: 1, text: 'Item 1' },
        { id: 2, text: 'Item 2' },
        { id: 3, text: 'Item 3' },
      ],
    },
    fn: async ({ target, component: instance }: { target: unknown; component?: unknown }) => {
      const removeButtons = (target as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.remove-btn',
      )
      removeButtons[0].click()
      await tick()
      return (instance as { itemsList: unknown[] }).itemsList.length
    },
    expect: 2,
    info: 'remove button correctly updates itemsList length',
  },
] satisfies TestCase[]
