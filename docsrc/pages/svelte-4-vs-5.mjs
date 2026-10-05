export const View = () => [
  h1({ id: 'svelte-4-vs-5' }, 'Svelte 4 vs 5'),

  p([
    'Testing Svelte components with @magic/test has different',
    ' capabilities depending on the Svelte version.',
  ]),

  h2({}, 'Feature Comparison'),

  Pre(`
| Feature | Svelte 4 | Svelte 5 |
| :------ | :------: | :------: |
| Component mounting | ✅ | ✅ |
| Component interaction | ✅ | ✅ |
| Auto-export ($state/$derived) | ❌ | ✅ |
| Runes | ❌ | ✅ |
| compileSvelte | ✅ | ✅ |
| createStaticPage | ✅ | ✅ |
| SvelteKit mocks | ✅ | ✅ |
`),

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

  ul([
    li([Link({ to: '/svelte/' }, 'Svelte Testing Guide')]),
    li([Link({ to: '/svelte-auto-export-faq/' }, 'Svelte Auto-Export FAQ')]),
  ]),
]
