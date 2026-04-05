import { html } from '../../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Button.svelte'

type TestTarget = {
  querySelector: (
    selector: string,
  ) => Element & { disabled: boolean; onclick: (() => void) | null; click: () => void }
  querySelectorAll: (selector: string) => (Element & { click: () => void })[]
}

export type TestCase = {
  component: string
  props?: Record<string, unknown>
  fn: (ctx: { target: TestTarget }) => boolean | Promise<boolean>
  expect?: boolean | ((result: boolean[]) => boolean)
  info?: string
}

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
    fn: ({ target }) => (target as TestTarget).querySelector('button').disabled,
    info: 'button disabled property is true',
  },
  {
    component,
    props: { disabled: false },
    fn: ({ target }) => !(target as TestTarget).querySelector('button').disabled,
    info: 'button disabled property is false when explicitly set',
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
      const button = (target as TestTarget).querySelector('button')
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
      const button = (target as TestTarget).querySelector('button')
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
  {
    component,
    props: { disabled: false, variant: 'primary' },
    fn: ({ target }) =>
      html(target).includes('btn primary') &&
      !(target as TestTarget).querySelector('button').disabled,
    info: 'button is enabled with explicit false and variant',
  },
  {
    component,
    fn: async ({ target }) => {
      return html(target).includes('btn primary')
    },
    info: 'default variant renders primary when no variant prop',
  },
  {
    component,
    props: { disabled: undefined, variant: undefined },
    fn: ({ target }) =>
      html(target).includes('btn') && !(target as TestTarget).querySelector('button').disabled,
    info: 'handles undefined props with defaults',
  },
] satisfies TestCase[]
