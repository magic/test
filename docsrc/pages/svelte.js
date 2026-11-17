export const View = () => [
  h1({ id: 'svelte' }, 'Svelte Testing'),

  p([
    '@magic/test has built-in support for testing Svelte 5 components:',
    ' it compiles your components, mounts them in a DOM,',
    ' and hands you helpers to poke at and assert on.',
  ]),

  p(['internally uses happy-dom to create the DOM and html elements.']),

  h2({ id: 'lib-svelte' }, 'mount'),

  Pre(`
import { mount, html } from '@magic/test/svelte'

const component = './path/to/MyComponent.svelte'

export default [
  {
    component,
    props: { message: 'Hello' },
    fn: ({ target }) => html(target).includes('Hello'),
    expect: true,
    info: 'renders the message prop',
  },
]
`),

  h3({}, 'Exported Functions'),

  ul([
    li(
      'mount(filePath, options) - mounts a component, returns { target, component, unmount, css }',
    ),
    li("html(target) - innerHTML of a mounted component's target element"),
    li('text(target) - textContent of a target element'),
    li('component(instance) - the component instance, for accessing exported values'),
    li('props(target) - attribute name/value pairs from the target element'),
    li('createSnippet(renderFn) - a raw snippet to pass as a children prop'),
    li("tick() - svelte's tick, retry-wrapped — await it after interactions"),
  ]),

  h3({}, 'Interaction Functions'),

  p('fire everything a user can do:'),

  ul([
    li(
      'mouse: click (target, selector?), dblClick, contextMenu, mouseDown/Up/Move/Enter/Leave/Over/Out',
    ),
    li('keys: keyDown, keyPress, keyUp (target, key), type, input, change'),
    li('focus: focus, focusIn, focusOut, blur, submit'),
    li('pointer: pointerDown, pointerUp, pointerMove, pointerOver, pointerOut'),
    li('touch: touchStart, touchMove, touchEnd'),
    li('drag: dragStart, drag, dragEnd, dragEnter, dragLeave, dragOver, drop'),
    li('clipboard: copy, cut, paste'),
    li('media: play, pause, ended, volumeChange'),
    li('animation: animationStart, animationEnd, animationIteration, transitionEnd'),
    li(
      'other: resize(target, w, h), scroll(target, x, y), checked, fireEvent, trigger(target, eventType, options?)',
    ),
  ]),

  h3({}, 'Test Properties'),

  ul([
    li('component - path to the .svelte file'),
    li('props - props to pass to the component'),
    li(
      'context - svelte context: a static object, or a factory (info: { target, props }) => object',
    ),
    li('fn - test function receiving { target, component, unmount }'),
  ]),

  h2({ id: 'svelte-state' }, 'Accessing Component State'),

  Pre(`
import { mount } from '@magic/test/svelte'

const component = './src/lib/svelte/components/Counter.svelte'

export default [
  {
    component,
    fn: async ({ target, component: instance }) => {
      return instance.count
    },
    expect: 0,
    info: 'initial count is 0',
  },
]
`),

  h2({ id: 'svelte-auto-export' }, 'Automatic Test Exports'),

  p([
    '$state and $derived variables are exported automatically,',
    ' so they are accessible in tests without manual exports.',
    " Svelte 5 only — svelte 4 components can't do this.",
  ]),

  Pre(`
<!-- Component.svelte -->
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
  <!-- No export needed! -->
</script>

<button class="inc">+</button>
<span>{doubled}</span>
`),

  p('and in the test:'),

  Pre(`
import { mount } from '@magic/test'

export default [
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.count,  // 0
    expect: 0,
    info: 'access $state without manual export',
  },
  {
    component: './Component.svelte',
    fn: async ({ component }) => component.doubled,  // 0 (derived)
    expect: 0,
    info: 'access $derived without manual export',
  },
]
`),

  p('works for every $state and $derived rune, no config.'),

  h2({ id: 'svelte-error' }, 'Testing Error Handling'),

  Pre(`
import { tryCatch } from '@magic/test'
import { mount } from '@magic/test/svelte'

const component = './src/lib/svelte/components/MyComponent.svelte'

export default [
  {
    fn: tryCatch(mount, component, { props: null }),
    expect: t => t.message === 'Props must be an object, got object',
    info: 'throws when props is null',
  },
]
`),

  h2({ id: 'lib-sveltekit-mocks' }, 'SvelteKit Mocks'),

  p('mocks SvelteKit $app modules:'),

  Pre(`
import { browser, dev, prod, createStaticPage } from '@magic/test/svelte'

export default [
  {
    fn: () => browser, // mocks a browser environment
    expect: true,
    info: 'always true',
  },
  {
    fn: () => dev, // production mode is set by -p
    expect: process.env.MAGIC_TEST_ENV !== 'production',
    info: 'true unless the run is in production mode (-p)',
  },
  {
    fn: () => prod, // production mode is set by -p
    expect: process.env.MAGIC_TEST_ENV === 'production',
    info: 'true only in production mode (-p)',
  },
]
`),

  h2({ id: 'lib-create-static-page' }, 'createStaticPage'),

  p('creates a static $app/state page proxy (url/params/state):'),

  Pre(`
import { createStaticPage } from '@magic/test/svelte'

export default [
  {
    fn: () => {
      const page = createStaticPage({ url: 'http://example.com', params: { id: '1' } })
      return page.url.hostname === 'example.com' && page.params.id === '1'
    },
    expect: true,
    info: 'createStaticPage returns a page proxy with url/params/state',
  },
]
`),

  h2({ id: 'lib-compile-svelte' }, 'compileSvelte'),

  p('compile a .svelte file to js/css (async, file path in):'),

  Pre(`
import { compileSvelte } from '@magic/test/svelte'

export default [
  {
    fn: async () => {
      const { js } = await compileSvelte('./path/to/button.svelte')
      return typeof js === 'string'
    },
    expect: true,
    info: 'compiles a svelte file to js/css',
  },
]
`),

  p('Available functions:'),

  ul([
    li('compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules'),
    li('ensureSvelte() - Lazy-loads the Svelte package, throws if not installed'),
  ]),

  h2({ id: 'svelte-ensure' }, 'ensureSvelte'),

  p('lazy-loads the svelte package, throws if it is not installed:'),

  Pre(`
import { ensureSvelte } from '@magic/test/svelte'

export default [
  {
    fn: async () => {
      const svelte = await ensureSvelte()
      return svelte.version.startsWith('5')
    },
    expect: true,
    info: 'loads svelte package',
  },
]
`),
]
