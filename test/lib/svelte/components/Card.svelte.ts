import { html } from '#lib/svelte/index.js'
import type { TestContext, TestCase } from '#src/types.js'
import { has } from '#lib/has.js'

const component = '#lib/svelte/testFixtures/components/Card.svelte'

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
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('card-header', 'My Card'),
    info: 'renders card with title when provided',
  },
  {
    component,
    props: { title: '' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.not.string('card-header'),
    info: 'does not render header when title is empty',
  },
  {
    component,
    props: { bordered: true },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('bordered'),
    info: 'renders card with bordered class when bordered is true',
  },
  {
    component,
    props: { bordered: false },
    fn: ({ target }: TestContext) => html(target),
    expect: has.not.string('bordered'),
    info: 'does not have bordered class when bordered is false',
  },
  {
    component,
    props: { title: 'Test', bordered: true },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('card-header', 'bordered'),
    info: 'renders card with both title and bordered',
  },
  {
    component,
    props: { title: 'Custom Content Card' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Custom Content Card'),
    info: 'renders card title correctly',
  },
] satisfies TestCase[]
