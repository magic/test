import { html } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Modal.svelte'

const test: any = {
  component,
  props: { open: false, title: 'Test Modal' },
  fn: async ({ target }: { target: any }) => {
    const result = html(target)
    return result === '' || result === '<!---->'
  },
  expect: true,
  info: 'does not render when open is false',
}

const test2: any = {
  component,
  props: { open: true, title: 'Test Modal' },
  fn: async ({ target }: { target: any }) => {
    const result = html(target)
    return result.includes('modal-overlay') && result.includes('Test Modal')
  },
  expect: true,
  info: 'renders modal when open is true',
}

export default [test, test2]
