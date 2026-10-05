export const View = () => [
  h1({ id: 'svelte-auto-export-faq' }, 'Svelte Auto-Export FAQ'),

  h2({}, 'What is Auto-Export?'),

  p([
    'When testing Svelte 5 components, @magic/test automatically exports ',
    '$state and $derived variables, making them accessible in tests',
    ' without requiring manual exports from the component.',
  ]),

  h2({}, 'Why is it Svelte 5 Only?'),

  p([
    'The auto-export feature relies on Svelte 5 runes ($state, $derived),',
    ' which use a different reactivity model from Svelte 4.',
    ' Svelte 5 compiles runes in a way that makes them discoverable',
    ' at runtime, enabling automatic export during testing.',
  ]),

  p([
    'Svelte 4 uses a traditional prop-driven or script-tag state model',
    ' that does not expose internal state the same way.',
  ]),

  h2({}, 'How to Manual-Export for Svelte 4'),

  p([
    'In Svelte 4, you must explicitly export variables to access them in tests:',
  ]),

  Pre(`
<!-- Component.svelte -->
<script>
  export let count = 0;
  export function increment() {
    count++
  }
</script>

<button on:click={increment}>
  {count}
</button>
`),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: ({ component }) => component.count,
    expect: 0,
    info: 'access exported count prop',
  },
]
`),

  h2({}, 'Examples'),

  h3({}, 'Svelte 5 - No Export Needed'),

  Pre(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),

  p('Test - works automatically!'),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled,
    expect: 0,
    info: 'access $derived without manual export',
  },
]
`),

  h2({}, 'See Also'),

  ul([
    li([Link({ to: '/svelte/' }, 'Svelte Testing Guide')]),
    li([Link({ to: '/svelte-4-vs-5/' }, 'Svelte 4 vs 5 Feature Comparison')]),
  ]),
]
