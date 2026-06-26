import { mount, html, trigger } from '../../../../../src/lib/svelte/index.js'
import { flushSync } from 'svelte'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Input.svelte'

export default [
  {
    component,
    fn: ({ target }: TestContext) => html(target).includes('text-input'),
    expect: true,
    info: 'renders text input element',
  },
  {
    component,
    props: { placeholder: 'Enter text...' },
    fn: ({ target }: TestContext) => html(target).includes('Enter text...'),
    expect: true,
    info: 'renders input with custom placeholder',
  },
  {
    component,
    fn: ({ component: instance }: TestContext) => instance['inputValue'],
    expect: '',
    info: 'inputValue starts empty by default',
  },
  {
    component,
    props: { value: 'initial' },
    fn: ({ component: instance }: TestContext) => instance['inputValue'],
    expect: 'initial',
    info: 'inputValue is set from value prop',
  },
  {
    component,
    fn: ({ component: instance }: TestContext) => instance['changed'],
    expect: false,
    info: 'changed is false initially',
  },
  {
    component,
    props: { value: 'test' },
    fn: ({ target }: TestContext) => html(target).includes('Length: 4'),
    expect: true,
    info: 'shows correct length for initial value',
  },
  {
    component,
    props: { value: '' },
    fn: ({ target }: TestContext) => html(target).includes('Type here...'),
    expect: true,
    info: 'uses default placeholder when not specified',
  },
  {
    component,
    fn: ({ component: instance }: TestContext) => instance['changed'],
    expect: false,
    info: 'changed remains false without interaction',
  },
  {
    component,
    props: { value: '' },
    fn: ({ target }: TestContext) => html(target).includes('Length: 0'),
    expect: true,
    info: 'shows Length: 0 for empty value',
  },
  {
    component,
    props: { value: 'abc' },
    fn: ({ component: instance }: TestContext) => instance['inputValue'],
    expect: 'abc',
    info: 'inputValue reflects the value prop',
  },
  {
    component,
    props: { value: 'hello' },
    fn: ({ target }: TestContext) => html(target).includes('Length: 5'),
    expect: true,
    info: 'shows correct length for hello',
  },
  {
    component,
    fn: ({ target }: TestContext) => {
      const input = target.querySelector('input')!
      input.value = 'changed'
      trigger(input, 'input')
      flushSync()
      return target.querySelector('.changed')?.textContent
    },
    expect: 'unchanged',
    info: 'changed state reflects current state',
  },
] satisfies TestCase[]
