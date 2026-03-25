import { html } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/Button.svelte'

export default [
  {
    component,
    props: { variant: 'primary' },
    fn: ({ target }) => html(target).includes('btn primary'),
    info: 'renders button with variant class',
  },
  {
    component,
    props: { disabled: true },
    fn: ({ target }) => target.querySelector('button').disabled,
    info: 'button disabled property is true',
  },
  {
    component,
    props: { variant: 'secondary' },
    fn: ({ target }) => html(target).includes('btn secondary'),
    info: 'renders button with secondary variant',
  },
  {
    component,
    props: { variant: 'danger' },
    fn: async ({ target }) => {
      return html(target).includes('btn danger')
    },
    info: 'renders button with danger variant',
  },
  {
    component,
    props: { onclick: () => {} },
    fn: async ({ target }) => {
      let clicked = false
      const button = target.querySelector('button')
      button.onclick = () => {
        clicked = true
      }
      button.click()
      return clicked
    },
    info: 'onclick handler is called on click',
  },
  {
    component,
    props: { disabled: true, onclick: () => {} },
    fn: async ({ target }) => {
      const button = target.querySelector('button')
      let clicked = false
      button.onclick = () => {
        clicked = true
      }
      button.click()
      return !clicked
    },
    info: 'disabled button does not trigger onclick',
  },
  {
    component,
    fn: async ({ target }) => {
      return html(target).includes('Click me')
    },
    info: 'renders default slot content',
  },
  {
    component,
    props: { variant: 'custom' },
    fn: ({ target }) => html(target).includes('btn custom'),
    info: 'renders button with custom variant',
  },
]
