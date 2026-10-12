/* ---------------------------------------------------------------------------
 * SvelteKit request store mock
 *
 * When the tested project has @sveltejs/kit installed, every test function is
 * executed inside a mocked SvelteKit request store, so SvelteKit server
 * internals — sequence(), getEvent()/getRequestEvent(), getContext(), error(),
 * ... — work in plain unit tests that call server hooks directly with a
 * hand-crafted event.
 *
 * The stored event/state are placeholders: as soon as a test invokes a
 * SvelteKit handle, sequence() re-establishes the store with the event that
 * was actually passed in, for the duration of the handle chain.
 *
 * In non-SvelteKit projects the dynamic import of
 * '@sveltejs/kit/internal/server' fails and the wrapper is a no-op. The
 * import attempt is cached, so non-SvelteKit projects pay a single failed
 * resolution per process/thread.
 * -------------------------------------------------------------------------- */

type RequestStoreLike = {
  event: Record<string, unknown>
  state: Record<string, unknown>
}

type KitServer = {
  with_request_store: (store: RequestStoreLike, fn: () => unknown) => unknown
  try_get_request_store?: () => unknown
}

let kitReady: Promise<KitServer | null> | null = null

const makeMockState = (): Record<string, unknown> => ({
  getClientAddress: () => '127.0.0.1',
  platform: null,
  error: false,
  rerouted_url: null,
  depth: 0,
  is_in_remote_function: false,
  is_in_remote_form_or_command: false,
  is_in_remote_query: false,
  is_in_remote_prerender: false,
  is_in_render: true,
  remote: {
    data: null,
    implicit: null,
    explicit: null,
    forms: null,
    requested: null,
    ignored: null,
    batches: null,
    live_iterators: null,
  },
})

const makeMockEvent = (): Record<string, unknown> => {
  const url = new URL('http://localhost/')
  return {
    request: new Request('http://localhost/'),
    url,
    params: {},
    locals: {},
    clientAddress: '127.0.0.1',
    getStack: () => 'magic-test mock event',
  }
}

// SvelteKit's event.js creates its AsyncLocalStorage instance in a microtask
// AFTER module evaluation, so the store does not work for async continuations
// right after the import resolves. Probe until an awaited call still sees the
// store (i.e. the ALS instance is live), waiting up to ~100ms.
const isStoreAsyncReady = async (kit: KitServer): Promise<boolean> => {
  const probe = kit.with_request_store({ event: {}, state: {} }, async () => {
    await Promise.resolve()
    return kit.try_get_request_store?.()
  })
  const result = await probe
  return result !== null && result !== undefined
}

const loadKit = (): Promise<KitServer | null> => {
  if (!kitReady) {
    kitReady = (async () => {
      let mod: unknown
      try {
        // indirect specifier: @sveltejs/kit is an optional peer of the tested
        // project, not a dependency of this package
        const specifier = '@sveltejs/kit/internal/server'
        mod = await import(specifier)
      } catch {
        return null
      }
      if (!mod || typeof (mod as KitServer).with_request_store !== 'function') {
        return null
      }
      const kit = mod as KitServer
      for (let i = 0; i < 100; i++) {
        if (await isStoreAsyncReady(kit)) {
          return kit
        }
        await new Promise(resolve => setTimeout(resolve, 1))
      }
      // never probed ready — unusual runtime; return the module anyway so
      // synchronous-only usage can still work via the sync store
      return kit
    })()
  }
  return kitReady
}

/**
 * Run `fn` inside a mocked SvelteKit request store when @sveltejs/kit is
 * installed in the tested project. Otherwise run `fn` as-is.
 */
export const withSvelteKitStore = async (fn: () => unknown): Promise<unknown> => {
  const kit = await loadKit()
  if (!kit) {
    return fn()
  }
  return kit.with_request_store({ event: makeMockEvent(), state: makeMockState() }, fn)
}
