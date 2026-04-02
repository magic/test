import { html, trigger } from '../../../src/lib/svelte/index.js'

const component = './src/lib/svelte/components/Input.svelte'

export default [
  {
    component,
    props: { placeholder: 'Enter text' },
    fn: async ({ target }) => {
      return html(target).includes('Enter text')
    },
    expect: true,
    info: 'renders input with placeholder',
  },
  {
    component,
    fn: async ({ target }) => {
      return html(target).includes('Type here...')
    },
    expect: true,
    info: 'uses default placeholder when not provided',
  },
  {
    component,
    props: { value: 'test' },
    fn: async ({ component: instance }) => {
      return instance.inputValue
    },
    expect: 'test',
    info: 'returns inputValue from component',
  },
  {
    component,
    fn: async ({ target, component: instance }) => {
      const input = target.querySelector('input')
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance.inputValue
    },
    expect: '',
    info: 'input updates inputValue on input',
  },
  {
    component,
    fn: async ({ target, component: instance }) => {
      const input = target.querySelector('input')
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance.changed
    },
    expect: true,
    info: 'changed becomes true after input',
  },
  {
    component,
    props: { value: '' },
    fn: async ({ target }) => {
      return html(target).includes('Length: 0')
    },
    expect: true,
    info: 'shows length 0 for empty input',
  },
  {
    component,
    props: { value: 'hello' },
    fn: async ({ target }) => {
      return html(target).includes('Length: 5')
    },
    expect: true,
    info: 'shows correct length for input',
  },
  {
    component,
    fn: async ({ target, component: instance }) => {
      return html(target).includes('unchanged')
    },
    expect: true,
    info: 'shows unchanged when no input yet',
  },
  {
    component,
    props: { value: 'typed' },
    fn: async ({ target }) => {
      return html(target).includes('changed')
    },
    expect: true,
    info: 'shows changed when value prop is set',
  },
  {
    component,
    fn: async ({ target, component: instance }) => {
      const input = target.querySelector('input')
      input.value = 'new value'
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance.inputValue === 'new value' && instance.changed
    },
    expect: true,
    info: 'input updates both value and changed state together',
  },
]
