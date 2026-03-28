import { html, createSnippet } from '../../../src/lib/index.js'

const component = './src/lib/svelte/components/SnippetButton.svelte'

export default [
  {
    component,
    props: {
      children: createSnippet(() => 'Click me'),
    },
    fn: ({ target }) => html(target).includes('Click me'),
    info: 'renders snippet content',
  },
  {
    component,
    props: {
      children: createSnippet(() => '<span>Custom Content</span>'),
      variant: 'primary',
    },
    fn: ({ target }) => html(target).includes('Custom Content'),
    info: 'renders custom snippet content',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Disabled Button'),
      disabled: true,
    },
    fn: ({ target }) => target.querySelector('button').disabled,
    info: 'button is disabled when disabled prop is true',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Enabled Button'),
      disabled: false,
    },
    fn: ({ target }) => !target.querySelector('button').disabled,
    info: 'button is enabled when disabled prop is false',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Variant Test'),
      variant: 'secondary',
    },
    fn: ({ target }) => html(target).includes('btn secondary'),
    info: 'renders button with secondary variant class',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Click Handler Test'),
      onclick: () => {},
    },
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
    props: {
      children: createSnippet(() => 'Primary Button'),
      variant: 'primary',
    },
    fn: ({ target }) => html(target).includes('btn primary'),
    info: 'renders button with primary variant class',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Custom Variant'),
      variant: 'custom',
    },
    fn: ({ target }) => html(target).includes('btn custom'),
    info: 'renders button with custom variant class',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'Default disabled'),
    },
    fn: ({ target }) => !target.querySelector('button').disabled,
    info: 'button is enabled by default when disabled not provided',
  },
  {
    component,
    props: {
      children: createSnippet(() => 'All undefined'),
      variant: undefined,
      disabled: undefined,
    },
    fn: ({ target }) => html(target).includes('btn') && !target.querySelector('button').disabled,
    info: 'handles undefined props for both variant and disabled',
  },
]
