import { html, trigger } from '../../../../../src/lib/svelte/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Input.svelte'

export default [
  {
    component,
    props: { placeholder: 'Enter text' },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Enter text')
    },
    expect: true,
    info: 'renders input with placeholder',
  },
  {
    component,
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Type here...')
    },
    expect: true,
    info: 'uses default placeholder when not provided',
  },
  {
    component,
    props: { value: 'test' },
    fn: async ({ component: instance }: TestContext) => {
      return instance['inputValue']
    },
    expect: 'test',
    info: 'returns inputValue from component',
  },
  {
    component,
    fn: async ({ target, component: instance }: TestContext) => {
      const input = target.querySelector('input') as HTMLInputElement | null
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance['inputValue']
    },
    expect: '',
    info: 'input updates inputValue on input',
  },
  {
    component,
    fn: async ({ target, component: instance }: TestContext) => {
      const input = target.querySelector('input') as HTMLInputElement | null
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance['changed']
    },
    expect: true,
    info: 'changed becomes true after input',
  },
  {
    component,
    props: { value: '' },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Length: 0')
    },
    expect: true,
    info: 'shows length 0 for empty input',
  },
  {
    component,
    props: { value: 'hello' },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('Length: 5')
    },
    expect: true,
    info: 'shows correct length for input',
  },
  {
    component,
    fn: async ({ target }: TestContext) => {
      return html(target).includes('unchanged')
    },
    expect: true,
    info: 'shows unchanged when no input yet',
  },
  {
    component,
    props: { value: 'typed' },
    fn: async ({ target }: TestContext) => {
      return html(target).includes('changed')
    },
    expect: true,
    info: 'shows changed when value prop is set',
  },
  {
    component,
    fn: async ({ target, component: instance }: TestContext) => {
      const input = target.querySelector('input') as HTMLInputElement
      input.value = 'new value'
      trigger(input, 'input')
      await new Promise(r => setTimeout(r, 10))
      return instance['inputValue'] === 'new value' && instance['changed']
    },
    expect: true,
    info: 'input updates both value and changed state together',
  },
] satisfies TestCase[]
