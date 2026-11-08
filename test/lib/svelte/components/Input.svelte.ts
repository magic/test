import { html, trigger } from '#lib/svelte/index.js'
import { flushSync } from 'svelte'
import type { TestContext, TestCase } from '#src/types.js'
import { has } from '#lib/has.js'

const component = '#lib/svelte/testFixtures/components/Input.svelte'

export default [
  {
    component,
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('text-input'),
    info: 'renders text input element',
  },
  {
    component,
    props: { placeholder: 'Enter text...' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Enter text...'),
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
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Length: 4'),
    info: 'shows correct length for initial value',
  },
  {
    component,
    props: { value: '' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Type here...'),
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
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Length: 0'),
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
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Length: 5'),
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
    expect: 'changed',
    info: 'changed state reflects current state',
  },
] satisfies TestCase[]
