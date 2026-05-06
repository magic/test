import { html } from '../../../../../src/lib/svelte/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Card.svelte'

export default [
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }: TestContext) => html(target).includes('My Card'),
    info: 'renders card with title class',
  },
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }: TestContext) => html(target).includes('bordered'),
    info: 'renders card with bordered class',
  },
  {
    component,
    fn: ({ target }: TestContext) => html(target).includes('Default card content'),
    info: 'renders default slot content',
  },
] satisfies TestCase[]
