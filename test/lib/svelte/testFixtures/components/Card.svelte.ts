import { html } from '../../../../../src/lib/svelte/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Card.svelte'

export default [
  {
    component,
    fn: ({ target }: TestContext) => html(target),
    expect:
      '<div class="card"><!----> <div class="card-content">Default card content<!----></div></div>',
    info: 'renders card with default slot content',
  },
  {
    component,
    props: { title: 'My Card' },
    fn: ({ target }: TestContext) =>
      html(target).includes('card-header') && html(target).includes('My Card'),
    expect: true,
    info: 'renders card with title when provided',
  },
  {
    component,
    props: { title: '' },
    fn: ({ target }: TestContext) => !html(target).includes('card-header'),
    expect: true,
    info: 'does not render header when title is empty',
  },
  {
    component,
    props: { bordered: true },
    fn: ({ target }: TestContext) => html(target).includes('bordered'),
    expect: true,
    info: 'renders card with bordered class when bordered is true',
  },
  {
    component,
    props: { bordered: false },
    fn: ({ target }: TestContext) => !html(target).includes('bordered'),
    expect: true,
    info: 'does not have bordered class when bordered is false',
  },
  {
    component,
    props: { title: 'Test', bordered: true },
    fn: ({ target }: TestContext) =>
      html(target).includes('card-header') && html(target).includes('bordered'),
    expect: true,
    info: 'renders card with both title and bordered',
  },
  {
    component,
    props: { title: 'Custom Content Card' },
    fn: ({ target }: TestContext) => html(target).includes('Custom Content Card'),
    expect: true,
    info: 'renders card title correctly',
  },
] satisfies TestCase[]
