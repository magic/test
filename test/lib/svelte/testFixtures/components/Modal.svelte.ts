import { html } from '../../../../../src/lib/svelte/index.js'
import type { TestContext, TestCase } from '../../../../../src/types.js'

const component = './src/lib/svelte/testFixtures/components/Modal.svelte'

export default [
  {
    component,
    props: { open: false },
    fn: ({ target }: TestContext) => html(target),
    expect: '<!---->',
    info: 'renders nothing when open is false',
  },
  {
    component,
    props: { open: true },
    fn: ({ target }: TestContext) => html(target).includes('modal-overlay'),
    expect: true,
    info: 'renders modal overlay when open is true',
  },
  {
    component,
    props: { open: true, title: 'Test Modal' },
    fn: ({ target }: TestContext) => html(target).includes('Test Modal'),
    expect: true,
    info: 'renders modal with custom title',
  },
  {
    component,
    props: { open: true, title: '' },
    fn: ({ target }: TestContext) => html(target).includes('modal-header'),
    expect: true,
    info: 'renders modal header even with empty title',
  },
  {
    component,
    props: { open: true },
    fn: ({ target }: TestContext) => html(target).includes('modal'),
    expect: true,
    info: 'renders modal with modal class',
  },
  {
    component,
    props: { open: true },
    fn: ({ target }: TestContext) => html(target).includes('modal-body'),
    expect: true,
    info: 'renders modal body section',
  },
  {
    component,
    props: { open: true, title: 'Custom Title' },
    fn: ({ target }: TestContext) =>
      html(target).includes('Custom Title') && html(target).includes('modal-overlay'),
    expect: true,
    info: 'renders modal with title and overlay',
  },
  {
    component,
    props: { open: false, title: 'Hidden' },
    fn: ({ target }: TestContext) => html(target),
    expect: '<!---->',
    info: 'does not render title when modal is closed',
  },
] satisfies TestCase[]
