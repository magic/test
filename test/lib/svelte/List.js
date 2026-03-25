import { html } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/List.svelte'

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
    fn: async ({ target }) => {
      const result = html(target)
      return result.includes('My List') && result.includes('Item 1') && result.includes('Item 2')
    },
    expect: true,
    info: 'renders list with items and title',
  },
  {
    component,
    props: { items: [{ id: 1, text: 'Item 1' }], title: 'My List' },
    fn: async ({ component: instance }) => {
      return instance.itemsList.length
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
    fn: async ({ target, component: instance }) => {
      const removeButtons = target.querySelectorAll('.remove-btn')
      removeButtons[0].click()
      await new Promise(r => setTimeout(r, 10))
      return instance.itemsList.length
    },
    expect: 1,
    info: 'remove button removes item from list',
  },
]
