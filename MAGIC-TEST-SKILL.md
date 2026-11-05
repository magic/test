---
name: magic-test
description: >
  Skill for writing and debugging tests with @magic/test
  (the `t` CLI: `npx t` / `npx t -p` / `npx t -e <file>`).
  Invoked when adding/fixing/triaging tests in a project that has
  @magic/test in dependencies, or when `t` runner, `satisfies Test[]`,
  or `@magic/test` coverage tables are mentioned.
---

# magic-test — clanker-facing specification

## Trigger conditions

Invoke this skill when any of these are true:

- Repository has `@magic/test` in `package.json` dependencies.
- User mentions `t` runner (`npx t`, `npx t -p`, `npx t -e`).
- User mentions `satisfies Test[]` or `@magic/test` coverage tables.
- Task requires writing, fixing, or triaging test files under `test/`.

## Commands

| Command                                    | Purpose                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `npm run test`                             | Usually, tests are defined in npm run test task                                                      |
| `npx t`                                    | Run all tests, dev/coverage mode, parses test files with typescript-estree                           |
| `npx t -p`                                 | Run all tests, `NODE_ENV=production`, faster, may mask breakage via `node_modules/.magic-test-cache` |
| `npx t -e <file>`                          | Dev mode; excludes `<file>` from coverage table; prints full per-file coverage table                 |
| `MAGIC_TEST_VERBOSE_ERRORS=1 npx t -e ...` | Prints full import error stacks during collection                                                    |

## Test file format

Minimal structure:

```ts
import type { Test } from '@magic/test'
import { fnUnderTest } from '../../src/lib/thing.js' // .js extension for .ts sources

export default [
  {
    fn: () => fnUnderTest('x'),
    expect: 'x-y',
    info: 'description',
  },
] satisfies Test[]
```

Hard rules:

- Test files live under `test/` and are discovered recursively.
- Never name a test file `index.ts` / `index.js` (collector imports index as-is and silently skips siblings).
- File must end with `] satisfies Test[]` on its own line.
- `import type { Test } from '@magic/test'` — type-only, erased.

## expect semantics

`fn` return value is compared against `expect`:

| `expect` type        | behavior                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| function             | called as `expect(result)`; passes when returns `true` (or result itself) |
| array                | every entry must pass                                                     |
| `true` / `false`     | strict `===`                                                              |
| `null` / `undefined` | exact match                                                               |
| string / number      | strict `===`                                                              |
| plain object         | deep equality only — no nested predicates                                 |
| other same-type      | deep equal                                                                |
| different type       | fail                                                                      |

`expect` runs in its own scope — only sees what `fn` returned. `fn` may return a value or a promise (promises awaited).

`is.*` predicates (from `@magic/types`):
`is.str`, `is.num`, `is.int`, `is.bool`, `is.null`, `is.undef`, `is.obj`, `is.arr`, `is.function`, `is.instance(e, Type)`, `is.error`, `is.objectNative`, `is.deep.equal`

`has.*` predicates (from `@magic/test`):
`has.property(key, check)`, `has.properties(spec)`, `has.any(spec)`, `has.nested('a.b', check)`, `has.string(...substrings)`, `has.at(i, check)`, `has.key(name)`, `has.keys(names)`, `has.includes`, `has.oneOf`, `has.matches(regex)`

## Anti-patterns → correct patterns

Anti: `{ fn: () => f() === 'x', expect: true }`
Correct: `{ fn: () => f(), expect: 'x' }`

Anti: `{ fn: () => { const o = f(); return o.key === 'v' }, expect: true }`
Correct: `{ fn: () => f(), expect: { key: 'v' } }` or `{ fn: () => f(), expect: (v) => has.properties(v, { key: 'v' }) }` or `{ fn: () => f(), expect: [is.obj, has.property('count', is.int)] }`

## Svelte component tests

Structure:

```ts
import type { Test } from '@magic/test'
import { createSnippet, tick } from '@magic/test/svelte'

export default [
  {
    component: 'src/lib/components/Foo.svelte', // path relative to project root
    props: { label: 'hi', children: createSnippet('child content') },
    fn: async ({ target }: { target: HTMLElement }) => {
      await tick() // after every Svelte state mutation
      return { text: target.textContent ?? '', hasBtn: !!target.querySelector('button') }
    },
    expect: (v: { text: string }) => v.text.includes('hi'),
  },
] satisfies Test[]
```

Hard rules:

- Never add `before`/`after` hooks to component tests — hooks route test to isolated-worker path where components are never mounted (`fn` receives `{}`).
- Component test bodies serialized (mount → fn → unmount holds mutex); plain tests in same file run in parallel.
- `createSnippet(string)` renders HTML as single root element. `createRawSnippet` inserts only first child.
- Svelte 5 delegates same-type events to common ancestor when component has 2+ elements with same event type — dispatch synthetic events with `{ bubbles: true }`.
- For snippet props use `createSnippet` — plain arrow function is not a snippet.

Global state mutation inside component tests:

- Capture original inside `fn`, restore in `finally`, `await tick()` after each mutation.
- Do not swap global store reference — other tests' effects hold it.
- Restore to exact original value (`undefined` !== `null`).

Per-file promise-chain lock for serializing global singletons:

```ts
let chain: Promise<unknown> = Promise.resolve()
const lock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = chain.then(fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}
// usage: fn: ({ target }) => lock(async () => { ... })
```

## Execution model

- Plain tests in a file run in parallel on main thread; share module state.
- Build scaffolding inside `fn` (local maps/state), never at module top.
- Make initial state assertions order-independent (clear first, then assert behavior).
- `before`/`after` hooks, `component` tests, fixed ports, or shared-file usage flip suite to worker strategy.
- Each fresh worker re-imports entire module graph (~5–10s). Prefer unhooked tests with safe state over hooks.
- Static regex looks for `globalThis|window|global|self|process.env` in test source to decide isolation — mentioning these can flip suite to workers unexpectedly.

## Environment facts (happy-dom + node)

| Fact                                                                              | Constraint / workaround                                                                            |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| No WebGL                                                                          | Skip mounting components that create `WebGLRenderer`                                               |
| No indexedDB                                                                      | Only guard branches of storage code testable                                                       |
| `WheelEvent` may be undefined                                                     | Build with `(window as any).WheelEvent` or `Object.assign(new Event('wheel', {...}), {deltaY})`    |
| `new Request(...)` strips headers                                                 | Strips `origin`, `referer` — pass fake request object with manual `headers.get`                    |
| FileReader                                                                        | Read result from `event.target.result`, not `event.result`                                         |
| Canvas 2d, IntersectionObserver, WebSocket, KeyboardEvent/PointerEvent/MouseEvent | Supported                                                                                          |
| Remote network calls                                                              | May hang ~30s — point SDK base URLs at dead port `http://127.0.0.1:9` for instant refused failures |
| SvelteKit `error(status, message)`                                                | Throws `HttpError` with `.status` — catch and assert `.status`                                     |

## SvelteKit patterns

### load functions

```ts
const mockFetch =
  (payload: unknown, status = 200) =>
  async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'content-type': 'application/json' },
    })

{
  fn: async () =>
    load({
      fetch: mockFetch({ items: [] }),
      url: { pathname: '/x/', searchParams: new URLSearchParams() },
      params: { id: '1' },
      parent: async () => ({}),
      data: {},
    } as never),
  expect: (v: { existing?: unknown }) => is.obj(v),
}
```

### Handle (middleware) functions

Handle receives `({ event, resolve })`, not the event:

```ts
const makeCtx = (over: Record<string, unknown> = {}) => {
  const event = { route: { id: '/x' }, locals: {}, ...over }
  const resolve = async (e: unknown) => ({ resolved: e })
  return { event, resolve }
}
// await handle({ event, resolve })
```

## Fake object patterns

Match exact API surface code under test touches; add methods as `TypeError`s reveal them.

Three.js editor fake:

```ts
const makeEditor = () => {
  const scene = new THREE.Scene()
  const sceneHelpers = new THREE.Group()
  const calls: Record<string, unknown[]> = { setKey: [], highlight: [] }
  const editor = {
    scene,
    sceneHelpers,
    config: {
      setKey: (k: string, v: unknown) => calls.setKey.push([k, v]),
      getKey: () => undefined,
    },
    utils: { formatNumber: (n: number) => String(Math.round(n)) },
    selectById: () => undefined,
    focusById: () => undefined,
    execute: () => undefined,
    addObject: (o: THREE.Object3D) => scene.add(o),
    getObjectMaterial: () => null,
    objectByUuid: (id: string) => scene.getObjectByProperty('uuid', id) ?? null,
    markReconciled: () => undefined,
    getReconcileBaseline: () => undefined,
    ARMInitDone: true,
    ARMAssets: [],
    videoMaterials: {
      setVideoTexture: () => {},
      getAddCommand: () => null,
      getRemoveCommand: () => null,
    },
    _calls: calls,
  }
  return editor
}
```

Rules:

- Fake editors for commands need `objectByUuid` (Map-backed) and real `scene` for `add`/`remove`.
- Command `type` fields must be full class name (e.g. `SetMaterialColorCommand`) for `fromJSON` reconstruction.
- Svelte store snapshot: `JSON.stringify`, mutate, restore with `Object.assign(store, JSON.parse(snapshot))` in `finally`. Do not swap global store reference.
- `instanceof`-checked values with strict constructor: `Object.assign(Object.create(SomeClass.prototype), { ...fields })`.

## Debugging actions

| Symptom                                                         | Action                                                                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `got: "undefined"`                                              | `fn` threw or timed out. Read `E_TEST_FN` block above fail line for error + stack                                                         |
| Truncated stack                                                 | Write stack to file from inside test: `fs.writeFileSync('/tmp/err.txt', e.stack)`                                                         |
| `ReferenceError: X is not defined` in catch                     | `X` declared inside `try` (block scope); catch is outside scope                                                                           |
| New test file breaks other files' tests                         | Bisect imports: move file out of `test/`, re-run, add imports one by one                                                                  |
| Static import of SvelteKit server module in component-test file | Replace with dynamic `await import(...)` inside `fn`                                                                                      |
| Cross-file component-test breakage                              | Search all test files for assignments to same Svelte store; audit save/restore pairs                                                      |
| Flaky collection / fewer tests than expected                    | System load — re-run                                                                                                                      |
| Flaky test results                                              | Run suite 2–3 times; if passes sometimes, look for shared state touched by parallel tests                                                 |
| `npm run test` passes but `npx t -p` fails (or vice versa)      | Compare modes; `-p` hides parse-level breakage via stale `.magic-test-cache`                                                              |
| Unclear framework behavior                                      | Read installed source in `node_modules/@magic/test/`: `README.md`, `dist/lib/svelte/*`, `dist/bin/lib/readRecursive.js`, `dist/run/lib/*` |

## Collection checks

After every run verify `Found N tests across M files` line against expected file/test count. Re-run if count is low (load-sensitive collection).
Clear `node_modules/.magic-test-cache` only after making the permanent fix.
