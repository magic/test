export const View = () => [
  h1({ id: 'svelte-4-vs-5' }, 'Svelte 4 vs 5'),

  p([
    'Testing Svelte components with @magic/test has different',
    ' capabilities depending on the Svelte version.',
    'These limitations are inherited from svelte.',
  ]),

  p(
    'The svelte 4 functionality is not tested, we moved all our libraries to svelte 5, there be dragons.',
  ),

  h2({}, 'Feature Comparison'),

  table([
    tr([th('Feature'), th('Svelte 4'), th('Svelte 5')]),
    tr([
      td('Component mounting'),
      td({ class: 'align-center' }, '✅'),
      td({ class: 'align-center' }, '✅'),
    ]),
    tr([
      td('Component interaction'),
      td({ class: 'align-center' }, '✅'),
      td({ class: 'align-center' }, '✅'),
    ]),
    tr([td('Auto-export ($state/$derived)'), td('❌'), td({ class: 'align-center' }, '✅')]),
    tr([td('Runes'), td('❌'), td({ class: 'align-center' }, '✅')]),
    tr([
      td('compileSvelte'),
      td({ class: 'align-center' }, '✅'),
      td({ class: 'align-center' }, '✅'),
    ]),
    tr([
      td('createStaticPage'),
      td({ class: 'align-center' }, '✅'),
      td({ class: 'align-center' }, '✅'),
    ]),
    tr([
      td('SvelteKit mocks'),
      td({ class: 'align-center' }, '✅'),
      td({ class: 'align-center' }, '✅'),
    ]),
  ]),

  h2({}, 'What Works in Both'),

  ul([
    li('Mounting components with mount()'),
    li('Component interaction via events (click, input, etc.)'),
    li('HTML assertions with html() and text()'),
    li('compileSvelte for source compilation'),
    li('createStaticPage for SvelteKit testing'),
  ]),

  h2({}, 'Svelte 5 Only'),

  ul([li('Auto-export of $state and $derived runes'), li('Rune-based reactivity')]),

  p([
    'Svelte 5 automatically exports $state and $derived variables,',
    ' making them accessible in tests without manual exports.',
  ]),

  h2({}, 'Workarounds for Svelte 4'),

  p([
    'Svelte 4 does not support automatic export of reactive state.',
    ' To access component state in tests:',
  ]),

  h3({}, 'Manual Export in Svelte 4'),

  Pre(`
<!-- Component.svelte -->
<script>
  export let count = 0;
</script>

<button on:click={() => count++}>
  {count}
</button>
`),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),

  h3({}, 'Svelte 5 Auto-Export'),

  Pre(`
<!-- Component.svelte (Svelte 5) -->
<script>
  let count = $state(0)
</script>

<button class="inc">+</button>
<span>{count}</span>
`),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // works automatically!
    expect: 0,
    info: 'access $state without manual export',
  },
]
`),

  h2({}, 'See Also'),
  Link({ to: '/svelte/' }, 'Svelte Testing Guide'),
]
