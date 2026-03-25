import { html } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/Modal.svelte'

export default [
  {
    component,
    props: { open: false, title: 'Test Modal' },
    fn: async ({ target }) => {
      const result = html(target)
      return result === '' || result === '<!---->'
    },
    expect: true,
    info: 'does not render when open is false',
  },
  {
    component,
    props: { open: true, title: 'Test Modal' },
    fn: async ({ target }) => {
      const result = html(target)
      return result.includes('modal-overlay') && result.includes('Test Modal')
    },
    expect: true,
    info: 'renders modal when open is true',
  },
]
