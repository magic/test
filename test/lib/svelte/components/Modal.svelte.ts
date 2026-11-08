import { html } from '#lib/svelte/index.js'
import type { TestContext, TestCase } from '#src/types.js'
import { has } from '#lib/has.js'

const component = '#lib/svelte/testFixtures/components/Modal.svelte'

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
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('modal-overlay'),
    info: 'renders modal overlay when open is true',
  },
  {
    component,
    props: { open: true, title: 'Test Modal' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Test Modal'),
    info: 'renders modal with custom title',
  },
  {
    component,
    props: { open: true, title: '' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('modal-header'),
    info: 'renders modal header even with empty title',
  },
  {
    component,
    props: { open: true },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('modal'),
    info: 'renders modal with modal class',
  },
  {
    component,
    props: { open: true },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('modal-body'),
    info: 'renders modal body section',
  },
  {
    component,
    props: { open: true, title: 'Custom Title' },
    fn: ({ target }: TestContext) => html(target),
    expect: has.string('Custom Title', 'modal-overlay'),
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
