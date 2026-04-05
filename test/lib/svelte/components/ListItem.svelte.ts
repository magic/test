import { mount, html } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/ListItem.svelte'

export default [
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }) => html(target).includes('class="list-item"'),
    expect: true,
    info: 'renders list item with class',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }) => html(target).includes('Test Item'),
    expect: true,
    info: 'renders item text',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }) => {
      const text = target.querySelector('.item-text')
      return text && text.textContent === 'Test Item'
    },
    expect: true,
    info: 'renders item text in span',
  },
  {
    component,
    props: { item: { text: 'With Remove' } },
    fn: ({ target }) => html(target).includes('remove-btn'),
    expect: false,
    info: 'does not render remove button when onRemove not provided',
  },
  {
    component,
    props: { item: { text: 'With Remove' }, onRemove: () => {} },
    fn: ({ target }) => html(target).includes('remove-btn'),
    expect: true,
    info: 'renders remove button when onRemove is provided',
  },
  {
    component,
    props: { item: { text: 'Click Test' }, onRemove: () => {} },
    fn: async ({ target }) => {
      const btn = target.querySelector('.remove-btn')
      return btn !== null
    },
    expect: true,
    info: 'remove button exists when onRemove is provided',
  },
  {
    component,
    props: { item: { text: '' } },
    fn: ({ target }) => {
      const text = target.querySelector('.item-text')
      return text && text.textContent === ''
    },
    expect: true,
    info: 'renders empty text',
  },
  {
    component,
    props: { item: { text: 'Long Text Here' } },
    fn: ({ target }) => html(target).includes('Long Text Here'),
    expect: true,
    info: 'renders long item text',
  },
]
