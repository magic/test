export const View = state => [
  h1({ id: 'svelte' }, 'Svelte Testing'),

  p([
    '@magic/test includes built-in support for testing Svelte 5 components.',
    ' It compiles Svelte components, mounts them in a DOM environment,',
    ' and provides utilities for interacting with and asserting on component behavior.',
  ]),

  p(['Internally uses js-dom to create the DOM and HTML elements.']),

  h2({ id: 'lib-svelte' }, 'mount'),

  Pre(`
import { mount, html, tryCatch } from '@magic/test'

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
      'mount(filePath, options) - Mounts a Svelte component and returns { target, component, unmount }',
    ),
    li("html(target) - Returns innerHTML of a mounted component's target element"),
    li('text(target) - Returns textContent of a target element'),
    li('component(instance) - Returns the component instance for accessing exported values'),
    li('props(target) - Returns an object of attribute name/value pairs from the target element'),
  ]),

  h3({}, 'Interaction Functions'),

  ul([
    li('click(target, selector?) - Clicks an element (optionally filtered by CSS selector)'),
    li('dblClick(target) - Double clicks'),
    li('contextMenu(target) - Right click'),
    li('mouseDown(target) - Mouse down'),
    li('mouseUp(target) - Mouse up'),
    li('mouseMove(target) - Mouse move'),
    li('mouseEnter(target) - Mouse enter'),
    li('mouseLeave(target) - Mouse leave'),
    li('mouseOver(target) - Mouse over'),
    li('mouseOut(target) - Mouse out'),
    li('keyDown(target, key) - Key down'),
    li('keyPress(target, key) - Key press'),
    li('keyUp(target, key) - Key up'),
    li('type(target, text) - Type text into input'),
    li('input(target, value) - Input value'),
    li('change(target, value) - Change event'),
    li('blur(target) - Blur event'),
    li('focus(target) - Focus event'),
    li('submit(target) - Submit form'),
    li('pointerDown(target) - Pointer down'),
    li('pointerUp(target) - Pointer up'),
    li('pointerMove(target) - Pointer move'),
    li('touchStart(target) - Touch start'),
    li('touchMove(target) - Touch move'),
    li('touchEnd(target) - Touch end'),
    li('copy(target) - Copy event'),
    li('cut(target) - Cut event'),
    li('paste(target) - Paste event'),
    li('dragStart(target) - Drag start'),
    li('drag(target) - Drag'),
    li('dragEnd(target) - Drag end'),
    li('dragEnter(target) - Drag enter'),
    li('dragLeave(target) - Drag leave'),
    li('dragOver(target) - Drag over'),
    li('drop(target) - Drop'),
    li('resize(target, w, h) - Resize'),
    li('scroll(target, x, y) - Scroll'),
    li('animationStart(target) - Animation start'),
    li('animationEnd(target) - Animation end'),
    li('transitionEnd(target) - Transition end'),
    li('play(target) - Play media'),
    li('pause(target) - Pause media'),
    li('trigger(target, eventType, options?) - Custom event'),
    li('checked(target) - Checkbox state'),
  ]),

  h3({}, 'Test Properties'),

  ul([
    li('component - Path to the .svelte file'),
    li('props - Props to pass to the component'),
    li('fn - Test function receiving { target, component, unmount }'),
  ]),

  h2({ id: 'svelte-state' }, 'Accessing Component State'),

  Pre(`
import { mount, html } from '@magic/test'

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
    'When testing Svelte 5 components, @magic/test automatically exports ',
    '$state and $derived variables, making them accessible in tests',
    ' without requiring manual exports.',
  ]),

  p([
    '**Note:** This automatic export feature is specific to **Svelte 5** only.',
    ' Svelte 4 components do not have this capability.',
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

  p('Test - works automatically!'),

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

  p('This works automatically for all $state and $derived runes. No configuration needed!'),

  h2({ id: 'svelte-error' }, 'Testing Error Handling'),

  Pre(`
import { mount, tryCatch } from '@magic/test'

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

  p('Mocks SvelteKit $app modules:'),

  Pre(`
import { browser, dev, prod, createStaticPage } from '@magic/test'

export default [
  {
    fn: () => browser, // true if in browser environment
    expect: false,
    info: 'not in browser by default',
  },
  {
    fn: () => dev, // true if in dev mode
    expect: process.env.NODE_ENV === 'development',
    info: 'dev reflects NODE_ENV',
  },
  {
    fn: () => prod, // true if in production mode
    expect: false,
    info: 'not in prod by default',
  },
]
`),

  h2({ id: 'lib-create-static-page' }, 'createStaticPage'),

  p('Creates a static page mock for SvelteKit testing:'),

  Pre(`
import { createStaticPage } from '@magic/test'

export default [
  {
    fn: createStaticPage,
    expect: t => typeof t.html === 'string' && typeof t.render === 'function',
    info: 'createStaticPage returns html string and render function',
  },
]
`),

  h2({ id: 'lib-compile-svelte' }, 'compileSvelte'),

  p('Compile Svelte component source to a module for testing:'),

  Pre(`
import { compileSvelte } from '@magic/test'

export default [
  {
    fn: async () => {
      const source = \`<button>Click</button>\`
      const { js, css } = compileSvelte(source, 'button.svelte')
      return js.code.includes('button') && css.code === ''
    },
    expect: true,
    info: 'compiles Svelte source to module',
  },
]
`),

  p('Available functions:'),

  ul([
    li('compileSvelte(source, filename) - Compiles Svelte source to JS/CSS modules'),
    li('ensureSvelte() - Lazy-loads the Svelte package, throws if not installed'),
  ]),

  h2({ id: 'svelte-ensure' }, 'ensureSvelte'),

  p('Lazy-loads the Svelte package. Throws if Svelte is not installed:'),

  Pre(`
import { ensureSvelte } from '@magic/test'

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
