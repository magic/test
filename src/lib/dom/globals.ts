import { AsyncLocalStorage } from 'node:async_hooks'
import is from '@magic/types'
import { Document as HappyDocument, Window as HappyWindow } from 'happy-dom'

import { createImagePolyfill } from './image.js'
import { createCanvasPolyfill } from './canvas.js'

let window: HappyWindow | null = null
let document: HappyDocument | null = null

// A process must have exactly ONE happy-dom window. Multiple copies of this
// module can be loaded in the same process (e.g. the dist/ build and the src/
// build of this package imported side by side — the native test runner mounts
// `component:` tests through the dist mount while test files import the src
// mount). Each copy used to create its own Window; the last `initGlobals()`
// call wins the global class references (Comment, Node, Text, ...), so a later
// mount swapping `globalThis.document`/`window` back to the other window left
// `instanceof Comment` checks in the Svelte runtime comparing against the
// wrong window's classes, mis-anchoring `{#if}` blocks.
// The Symbol.for key lets a copy that has not created a window yet adopt the
// window an earlier copy already installed.
const SHARED_WINDOW_KEY = Symbol.for('@magic/test.happy-dom.window')

const sharedWindow = (): HappyWindow | null =>
  ((globalThis as Record<PropertyKey, unknown>)[SHARED_WINDOW_KEY] as HappyWindow | undefined) ??
  null

const setSharedWindow = (win: HappyWindow): void => {
  ;(globalThis as Record<PropertyKey, unknown>)[SHARED_WINDOW_KEY] = win
}

export const define = (
  target: Record<string | symbol, unknown>,
  key: string | symbol,
  value: unknown,
): void => {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  })
}

/* ---------------------------------------------------------------------------
 * DOM timer lifecycle tracking
 *
 * Node timers scheduled through the window (happy-dom forwards them to real
 * node timers) are ref'd. Two problems if they outlive the code that
 * scheduled them:
 *   1. correctness — a leftover callback firing into a LATER test;
 *   2. process lifetime — pending timers stall the runner's natural exit.
 *
 * So the installed setTimeout/setInterval wrappers record every ID in:
 *   - a process-wide registry (for the CLI's end-of-run backstop sweep), and
 *   - the active timer scope's bucket, when one is active. The runner opens
 *     a scope per suite (beforeAll → afterAll) and a nested one per test,
 *     and `end()` clears the bucket — so a test's timers die when the test
 *     is done, not at process exit.
 *
 * AsyncLocalStorage scopes (instead of set-diffing) make parallel
 * main-thread suites safe: each test's async context carries its own bucket,
 * so one test's sweep can never clear a sibling test's pending timers.
 *
 * The state lives on globalThis under a Symbol.for key — NOT in module
 * scope — because two copies of this module can coexist in one process (the
 * dist build the loader installs the wrappers with and the src build test
 * files import); both must see the same registry and the same ALS. Each
 * worker thread has its own globalThis, so the state stays per-process.
 * -------------------------------------------------------------------------- */

type TimerBucket = {
  timeouts: Set<unknown>
  intervals: Set<unknown>
}

type TimerState = {
  /** every pending ID scheduled through the DOM globals (backstop sweep) */
  registry: Set<unknown>
  /** per-execution-context buckets (suite → test nesting) */
  als: AsyncLocalStorage<TimerBucket | undefined>
}

// Marker for the installed timer wrappers (checked cross-module-copy:
// src/lib/svelte/mount.ts must not clobber them with the raw window
// methods — see hasTrackedTimerGlobals).
const TRACKED_TIMER_KEY = Symbol.for('@magic/test.tracked-timer')

const markTracked = (fn: unknown): void => {
  try {
    Object.defineProperty(fn, TRACKED_TIMER_KEY, {
      value: true,
      enumerable: false,
      configurable: true,
      writable: false,
    })
  } catch {
    // exotic function — the marker is a hint, not a contract
  }
}

/**
 * True when the process's setTimeout global is the tracked wrapper installed
 * by initGlobals (as opposed to the raw window methods or node natives).
 * Used by the svelte mount path, which must not overwrite them — doing so
 * would silently disable timer tracking for the rest of the run (every
 * main-thread component mount hit this).
 */
export const hasTrackedTimerGlobals = (): boolean => {
  const st = globalThis.setTimeout as unknown as Record<PropertyKey, unknown> | undefined
  return !!st && st[TRACKED_TIMER_KEY] === true
}

const TIMER_STATE_KEY = Symbol.for('@magic/test.dom-timers')

const getTimerState = (): TimerState => {
  const g = globalThis as Record<PropertyKey, unknown>
  let st = g[TIMER_STATE_KEY] as TimerState | undefined
  if (!st) {
    st = {
      registry: new Set<unknown>(),
      als: new AsyncLocalStorage<TimerBucket | undefined>(),
    }
    g[TIMER_STATE_KEY] = st
  }
  return st
}

const DOM_TIMER_TRACKING_CAP = 10_000

const recordDomTimer = (id: unknown, kind: 'timeout' | 'interval'): void => {
  const st = getTimerState()
  st.registry.add(id)
  // Long-lived workers must not grow the registry without bound; above the
  // cap we drop tracking (scopes keep working — the registry only feeds the
  // end-of-run backstop).
  if (st.registry.size > DOM_TIMER_TRACKING_CAP) {
    st.registry.clear()
  }
  const bucket = st.als.getStore()
  if (bucket) {
    if (kind === 'timeout') {
      bucket.timeouts.add(id)
    } else {
      bucket.intervals.add(id)
    }
  }
}

const untrackDomTimer = (id: unknown): void => {
  getTimerState().registry.delete(id)
}

export type TimerScope = {
  /**
   * Run fn with this scope as the active timer context. Timers scheduled
   * inside (including in promises and nested timer callbacks) are recorded
   * in this scope's bucket, not any outer scope's.
   */
  run: <T>(fn: () => T) => T
  /**
   * Clear every timer recorded in this bucket (via the installed
   * clearTimeout/clearInterval, so already-fired and already-cleared IDs are
   * no-ops) and return how many were cleared. Safe to call once at the
   * boundary the scope covers (test end / suite end).
   */
  end: () => number
}

export const beginTimerScope = (): TimerScope => {
  const st = getTimerState()
  const bucket: TimerBucket = { timeouts: new Set<unknown>(), intervals: new Set<unknown>() }
  const end = (): number => {
    let cleared = 0
    for (const id of bucket.timeouts) {
      try {
        clearTimeout(id as never)
        cleared++
      } catch {
        // never let a weird ID break teardown
      }
    }
    for (const id of bucket.intervals) {
      try {
        clearInterval(id as never)
        cleared++
      } catch {
        // never let a weird ID break teardown
      }
    }
    bucket.timeouts.clear()
    bucket.intervals.clear()
    return cleared
  }
  return {
    run: <T>(fn: () => T): T => st.als.run(bucket, fn),
    end,
  }
}

/**
 * End-of-run backstop: unref (not clear) every ID still pending in the
 * process-wide registry, so the process can exit naturally. Called by the
 * CLI after the run — by then per-test/per-suite scopes have already cleared
 * what they owned; anything left here escaped scoping (module-top-level
 * schedules, timers created through replaced globals) and is no longer live
 * test work. Returns how many IDs were processed.
 */
export const releaseDomHandles = (): number => {
  const st = getTimerState()
  let released = 0
  for (const id of st.registry) {
    try {
      const t = id as { unref?: () => unknown } | null | undefined
      if (t && typeof t.unref === 'function') {
        t.unref()
      }
      released++
    } catch {
      // never let a weird timer ID break teardown
    }
  }
  st.registry.clear()
  return released
}

/** @internal test helper — how many DOM timers are currently tracked */
export const trackedDomTimerCount = (): number => getTimerState().registry.size

export const initGlobals = (): { window: HappyWindow; document: HappyDocument } => {
  if (!window && !document) {
    const existing = sharedWindow()
    if (existing && existing.document) {
      window = existing
      document = existing.document as unknown as HappyDocument
    }
  }
  if (window && document) {
    setSharedWindow(window)
    define(globalThis, 'addEventListener', window!.addEventListener!.bind(window!))
    define(globalThis, 'removeEventListener', window!.removeEventListener!.bind(window!))
    // Re-set Event globals to ensure happy-dom's Event is used
    // (Node.js native Event may have overwritten it)
    define(globalThis, 'Event', window!.Event)
    define(globalThis, 'CustomEvent', window!.CustomEvent)
    define(globalThis, 'MouseEvent', window!.MouseEvent)
    define(globalThis, 'KeyboardEvent', window!.KeyboardEvent)
    define(globalThis, 'InputEvent', window!.InputEvent)
    define(globalThis, 'TouchEvent', window!.TouchEvent)
    define(globalThis, 'PointerEvent', window!.PointerEvent)
    return {
      window,
      document,
    }
  }
  window = new HappyWindow({ url: 'http://localhost/' })
  setSharedWindow(window)
  document = window!.document as unknown as HappyDocument

  define(globalThis, 'document', document)
  define(globalThis, 'window', window)
  define(globalThis, 'self', window)
  define(globalThis, 'navigator', window!.navigator)
  define(globalThis, 'location', window!.location)
  define(globalThis, 'history', window!.history)

  define(globalThis, 'Node', window!.Node)
  define(globalThis, 'Element', window!.Element)
  define(globalThis, 'HTMLElement', window!.HTMLElement)
  define(globalThis, 'SVGElement', window!.SVGElement)
  define(globalThis, 'Document', window!.Document)
  define(globalThis, 'DocumentFragment', window!.DocumentFragment)
  define(globalThis, 'Comment', window!.Comment)
  define(globalThis, 'Text', window!.Text)

  define(globalThis, 'Event', window!.Event)
  define(globalThis, 'CustomEvent', window!.CustomEvent)
  define(globalThis, 'MouseEvent', window!.MouseEvent)
  define(globalThis, 'KeyboardEvent', window!.KeyboardEvent)
  define(globalThis, 'InputEvent', window!.InputEvent)
  define(globalThis, 'TouchEvent', window!.TouchEvent)
  define(globalThis, 'PointerEvent', window!.PointerEvent)

  define(globalThis, 'FormData', window!.FormData)
  define(globalThis, 'File', window!.File)
  define(globalThis, 'FileList', window!.FileList)
  define(globalThis, 'Blob', window!.Blob)
  define(globalThis, 'URL', window!.URL)
  define(globalThis, 'URLSearchParams', window!.URLSearchParams)

  define(globalThis, 'MutationObserver', window!.MutationObserver)
  define(globalThis, 'IntersectionObserver', window!.IntersectionObserver)
  define(globalThis, 'ResizeObserver', window!.ResizeObserver)
  define(globalThis, 'PerformanceObserver', window!.PerformanceObserver)

  define(globalThis, 'FileReader', window!.FileReader)

  const PolyfilledImage = createImagePolyfill(window!)
  define(globalThis, 'Image', PolyfilledImage)
  define(globalThis, 'HTMLImageElement', window.HTMLImageElement)

  define(globalThis, 'HTMLCanvasElement', window.HTMLCanvasElement)
  createCanvasPolyfill()

  define(globalThis, 'TextEncoder', window!.TextEncoder)
  define(globalThis, 'TextDecoder', window!.TextDecoder)
  define(globalThis, 'atob', window!.atob)
  define(globalThis, 'btoa', window!.btoa)

  define(globalThis, 'Storage', window!.Storage)
  define(globalThis, 'sessionStorage', window!.sessionStorage)
  define(globalThis, 'localStorage', window!.localStorage)

  define(globalThis, 'Headers', window!.Headers)
  define(globalThis, 'Request', window!.Request)
  define(globalThis, 'Response', window!.Response)
  define(globalThis, 'AbortController', window!.AbortController)
  define(globalThis, 'AbortSignal', window!.AbortSignal)

  define(globalThis, 'ReadableStream', window!.ReadableStream)
  define(globalThis, 'WritableStream', window!.WritableStream)
  define(globalThis, 'TransformStream', window!.TransformStream)

  define(globalThis, 'XMLHttpRequest', window!.XMLHttpRequest)
  define(globalThis, 'DOMParser', window!.DOMParser)
  define(globalThis, 'XMLSerializer', window!.XMLSerializer)

  define(globalThis, 'WebSocket', window!.WebSocket)

  define(globalThis, 'CustomElementRegistry', window!.CustomElementRegistry)
  define(globalThis, 'customElements', window!.customElements)

  define(globalThis, 'MessagePort', window!.MessagePort)

  define(globalThis, 'MediaStream', window!.MediaStream)
  define(globalThis, 'MediaStreamTrack', window!.MediaStreamTrack)

  define(globalThis, 'Audio', window!.Audio)

  const winRecord = window!
  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  for (const [key, value] of Object.entries(winRecord)) {
    if (key.startsWith('SVG') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  define(globalThis, 'globalThis', globalThis)

  // The wrappers always call the window's own methods (repeated initGlobals
  // calls never double-wrap) and record IDs for the tracking above. They
  // carry TRACKED_TIMER_KEY so other code (mount.ts) can tell them apart
  // from the raw window methods.
  const trackedSetTimeout = (
    cb: (...args: never[]) => void,
    ms?: number | null,
    ...args: unknown[]
  ) => {
    const id = window!.setTimeout(cb as never, ms as number, ...(args as never[]))
    recordDomTimer(id, 'timeout')
    return id
  }
  const trackedClearTimeout = (id?: unknown) => {
    untrackDomTimer(id)
    window!.clearTimeout(id as never)
  }
  const trackedSetInterval = (
    cb: (...args: never[]) => void,
    ms?: number | null,
    ...args: unknown[]
  ) => {
    const id = window!.setInterval(cb as never, ms as number, ...(args as never[]))
    recordDomTimer(id, 'interval')
    return id
  }
  const trackedClearInterval = (id?: unknown) => {
    untrackDomTimer(id)
    window!.clearInterval(id as never)
  }
  for (const fn of [
    trackedSetTimeout,
    trackedClearTimeout,
    trackedSetInterval,
    trackedClearInterval,
  ]) {
    markTracked(fn)
  }
  define(globalThis, 'setTimeout', trackedSetTimeout)
  define(globalThis, 'clearTimeout', trackedClearTimeout)
  define(globalThis, 'setInterval', trackedSetInterval)
  define(globalThis, 'clearInterval', trackedClearInterval)

  define(globalThis, 'requestAnimationFrame', window!.requestAnimationFrame)
  define(globalThis, 'cancelAnimationFrame', window!.cancelAnimationFrame)

  define(globalThis, 'fetch', window!.fetch)
  define(globalThis, 'queueMicrotask', window!.queueMicrotask)

  return {
    window,
    document,
  }
}
