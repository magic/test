import { html } from '../../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/testFixtures/components/Card.svelte'

type TestCase = {
  component: string
  props?: Record<string, unknown>
  fn: (ctx: { target: unknown }) => boolean | Promise<boolean>
  info?: string
}

export default [
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }: { target: unknown }) => html(target).includes('My Card'),
    info: 'renders card with title class',
  },
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }: { target: unknown }) => html(target).includes('bordered'),
    info: 'renders card with bordered class',
  },
  {
    component,
    fn: ({ target }: { target: unknown }) => html(target).includes('Default card content'),
    info: 'renders default slot content',
  },
] satisfies TestCase[]
