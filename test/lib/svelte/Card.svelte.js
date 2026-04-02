import { html } from '../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Card.svelte'

export default [
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }) => html(target).includes('My Card'),
    info: 'renders card with title class',
  },
  {
    component,
    props: { title: 'My Card', bordered: true },
    fn: ({ target }) => html(target).includes('bordered'),
    info: 'renders card with bordered class',
  },
  {
    component,
    fn: ({ target }) => html(target).includes('Default card content'),
    info: 'renders default slot content',
  },
]
