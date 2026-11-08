import { html } from '#lib/svelte/index.js'
import type { TestContext, TestCase } from '#src/types.js'
import { has } from '#lib/has.js'

const component = '#lib/svelte/testFixtures/components/ListItem.svelte'

export default [
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('class="list-item"'),
    info: 'renders list item with class',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Test Item'),
    info: 'renders item text',
  },
  {
    component,
    props: { item: { text: 'Test Item' } },
    fn: ({ target }: TestContext) => {
      const text = target.querySelector('.item-text')
      return text?.textContent ?? null
    },
    expect: 'Test Item',
    info: 'renders item text in span',
  },
  {
    component,
    props: { item: { text: 'With Remove' } },
    fn: ({ target }: TestContext) => html(target).includes('remove-btn'),
    expect: false,
    info: 'does not render remove button when onRemove not provided',
  },
  {
    component,
    props: { item: { text: 'With Remove' }, onRemove: () => {} },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('remove-btn'),
    info: 'renders remove button when onRemove is provided',
  },
  {
    component,
    props: { item: { text: 'Click Test' }, onRemove: () => {} },
    fn: async ({ target }: TestContext) => {
      const btn = target.querySelector('.remove-btn')
      return btn
    },
    expect: (v: Element | null) => v !== null,
    info: 'remove button exists when onRemove is provided',
  },
  {
    component,
    props: { item: { text: '' } },
    fn: ({ target }: TestContext) => {
      const text = target.querySelector('.item-text')
      return text?.textContent ?? null
    },
    expect: '',
    info: 'renders empty text',
  },
  {
    component,
    props: { item: { text: 'Long Text Here' } },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Long Text Here'),
    info: 'renders long item text',
  },
] satisfies TestCase[]
