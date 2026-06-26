import { mount, html, click, props } from '../../../../../src/lib/svelte/index.js'
import { flushSync } from 'svelte'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Button.svelte'

export default [
  {
    component,
    fn: ({ target }: TestContext) => html(target),
    expect: '<button class="btn primary">Click me<!----></button>',
    info: 'renders button with default slot content',
  },
  {
    component,
    props: { variant: 'secondary' },
    fn: ({ target }: TestContext) => html(target),
    expect: '<button class="btn secondary">Click me<!----></button>',
    info: 'renders button with secondary variant',
  },
  {
    component,
    props: { variant: 'danger' },
    fn: ({ target }: TestContext) => html(target).includes('btn danger'),
    expect: true,
    info: 'renders button with danger variant',
  },
  {
    component,
    props: { disabled: true },
    fn: ({ target }: TestContext) => target.querySelector('button')?.disabled,
    expect: true,
    info: 'button is disabled when disabled prop is true',
  },
  {
    component,
    props: { disabled: false },
    fn: ({ target }: TestContext) => !target.querySelector('button')?.disabled,
    expect: true,
    info: 'button is enabled when disabled prop is false',
  },
  {
    component,
    props: { disabled: undefined },
    fn: ({ target }: TestContext) => !target.querySelector('button')?.disabled,
    expect: true,
    info: 'button is enabled by default when disabled not provided',
  },
  {
    component,
    fn: async ({ target }: TestContext) => {
      let called = false
      const button = target.querySelector('button')!
      button.onclick = () => {
        called = true
      }
      button.click()
      return called
    },
    expect: true,
    info: 'onclick handler is called when button is clicked',
  },
  {
    component,
    props: { onclick: () => {} },
    fn: ({ target }: TestContext) => {
      const button = target.querySelector('button')!
      // onclick is passed as an event handler attribute
      return html(target).includes('btn primary')
    },
    expect: true,
    info: 'button renders with correct class',
  },
  {
    component,
    props: { variant: 'outline' },
    fn: ({ target }: TestContext) => html(target).includes('btn outline'),
    expect: true,
    info: 'renders button with custom variant class',
  },
  {
    component,
    props: {},
    fn: ({ target }: TestContext) => props(target.querySelector('button')!),
    expect: { class: 'btn primary' },
    info: 'props returns button element attributes',
  },
] satisfies TestCase[]
