import { html } from '#lib/svelte/index.js'
import { has } from '#lib/has.js'
import type { TestContext } from '#src/types.js'

const component = '#lib/svelte/testFixtures/components/Modal.svelte'

export default [
  {
    component,
    props: { open: false, title: 'Test Modal' },
    fn: async ({ target }: TestContext) => {
      const result = html(target)
      return result
    },
    expect: has.oneOf('', '<!---->'),
    info: 'does not render when open is false',
  },
  {
    component,
    props: { open: true, title: 'Test Modal' },
    fn: async ({ target }: TestContext) => {
      const result = html(target)
      return result
    },
    expect: has.string('modal-overlay', 'Test Modal'),
    info: 'renders modal when open is true',
  },
]
