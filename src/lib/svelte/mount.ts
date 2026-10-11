import { createRequire } from 'node:module'
import path from 'node:path'

import type { SvelteComponent } from 'svelte'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { compileSvelteWithWrite } from './compile/index.js'
import {
  findNearestPackageJson,
  resolveImportMapSpecifier,
} from '../../lib/svelte/compile/resolveImportMap.js'
import { initDOM, getDocument, getWindow } from '../../lib/dom/index.js'
import type { CssObject, ComponentProps } from '../../types.js'
import { createContext, runWithContext } from './shims/$app/state.js'
import { detectSvelteKitImports, needsSvelteKitContext } from './detect-sveltekit-imports.js'

let svelteMount: (component: unknown, options: unknown) => SvelteComponent

let svelteUnmount: (component: unknown, options?: unknown) => Promise<void> | undefined

let svelteCreateRawSnippet: ((snippet: () => { render: () => string }) => unknown) | null = null

let svelteTick: (() => Promise<void>) | undefined

// Internal client context API (push/pop/setContext) - used to synthesize a
// context-providing wrapper component for tests that pass a `context` option.
// Loaded from the same internal module that compiled components import
// (svelte/internal/client), so there is a single component_context stack.
let sveltePush: ((props: unknown, runes?: boolean) => void) | null = null

let sveltePop: ((component?: unknown) => unknown) | null = null

let svelteSetContext: ((key: PropertyKey, context: unknown) => unknown) | null = null

let svelteInitialized = false

// Track mounted component state to ensure proper cleanup per-test
let mountedComponent: SvelteComponent | null = null
let mountedInternalUnmount: (() => Promise<void>) | null = null
let mountedTarget: HTMLElement | null = null

// Mutex to ensure only one Svelte component test runs at a time
// This prevents race conditions in Svelte's internal listeners Map
let svelteMutex: Promise<void> = Promise.resolve()

const acquireMutex = async (): Promise<() => void> => {
  let release: () => void
  const released = new Promise<void>(resolve => {
    release = resolve
  })
  const current = svelteMutex
  svelteMutex = released
  await current
  return release!
}

/**
 * Safely unmount the current component if one exists.
 * This ensures clean state before mounting a new component.
 * Called while holding the mutex, so uses internal unmount (doesn't release mutex).
 */
const safeUnmount = async (): Promise<void> => {
  if (mountedInternalUnmount) {
    try {
      await mountedInternalUnmount()
    } catch {
      // Ignore unmount errors - component might already be unmounted
    }
    mountedInternalUnmount = null
  }
  if (mountedTarget) {
    try {
      mountedTarget.remove()
    } catch {
      // Ignore remove errors
    }
    mountedTarget = null
  }
  mountedComponent = null
}

const initSvelte = async () => {
  if (svelteInitialized) {
    return
  }

  initDOM()

  let svelte

  // Use require to load svelte/src/index-client.js directly
  // This gives us the actual client-side mount function
  try {
    const sveltePath = path.join(process.cwd(), 'node_modules/svelte/src/index-client.js')
    const require = createRequire(import.meta.url)
    svelte = require(sveltePath)
    svelteMount = svelte.mount
    svelteUnmount = svelte.unmount
    svelteTick = svelte.tick
    svelteCreateRawSnippet = svelte.createRawSnippet || null

    // Same explicit-path require strategy as index-client.js above.
    // context.js is the module re-exported by svelte/internal/client
    // (push/pop/setContext), i.e. the exact instance compiled components use.
    const internalPath = path.join(
      process.cwd(),
      'node_modules/svelte/src/internal/client/context.js',
    )
    const internal = require(internalPath)
    sveltePush = internal.push
    sveltePop = internal.pop
    svelteSetContext = internal.setContext

    svelteInitialized = true
    return
  } catch (e) {
    const err = is.error(e) ? e : new Error(String(e))
    throw new Error(`Failed to initialize Svelte: ${err.message}`, { cause: e })
  }
}

/**
 * Create a raw snippet for passing as children prop
 */
export const createSnippet = (renderFn: string | (() => string)) => {
  // Try to initialize synchronously - if it returns a promise, that's fine
  // because we'll await it in mount() anyway
  initSvelte()

  const render = is.str(renderFn) ? () => renderFn : renderFn

  if (!svelteCreateRawSnippet) {
    throw new Error('Svelte not initialized. Make sure to call mount() first.')
  }

  return svelteCreateRawSnippet(() => ({ render }))
}

/**
 * Wait for Svelte to update the DOM after state changes
 */
export const tick = async () => {
  await initSvelte()
  if (!svelteTick) {
    throw new Error('Svelte not initialized')
  }
  // Wrap svelteTick in a try-catch to handle cases where Svelte's internal
  // state (listeners Map) might be corrupted due to parallel test execution
  try {
    await svelteTick()
  } catch (e) {
    // If tick fails due to Svelte internal errors (like corrupted listeners Map),
    // wait a bit and try again. This can happen when tests run in parallel
    // and Svelte's internal state gets corrupted.
    if (is.instance(e, Error) && e.message.includes('Cannot read properties')) {
      // Give Svelte a chance to recover
      await new Promise(resolve => setTimeout(resolve, 10))
      try {
        await svelteTick()
      } catch {
        // If it still fails, just log and continue
        log.warn('Svelte tick failed twice, continuing...')
      }
    } else {
      throw e
    }
  }
}

interface MountResult {
  target: HTMLElement
  component: Record<string, unknown>
  unmount: () => Promise<void>
  css: CssObject | null
}

/**
 * Synthesize a wrapper component that sets the given context entries
 * (setContext semantics) before rendering the target component.
 * The wrapper matches the shape of a Svelte-compiled wrapper component
 * (push -> setContext calls -> child render -> pop), so it behaves identically
 * to a .svelte wrapper in both standard and async component modes.
 */
const wrapWithContext = (
  Component: (...args: unknown[]) => unknown,
  entries: [PropertyKey, unknown][],
): ((...args: unknown[]) => unknown) => {
  if (!sveltePush || !sveltePop || !svelteSetContext) {
    throw new Error('Svelte not initialized')
  }
  const push = sveltePush
  const pop = sveltePop
  const setContext = svelteSetContext

  return ($$anchor: unknown, $$props: unknown) => {
    push($$props, true)
    for (const [key, value] of entries) {
      setContext(key, value)
    }
    Component($$anchor, $$props)
    pop()
  }
}

export const mount = async (
  filePath: string,
  options: { props?: ComponentProps; context?: Record<PropertyKey, unknown> } = {},
): Promise<MountResult> => {
  // Acquire mutex to ensure only one Svelte component test runs at a time
  const releaseMutex = await acquireMutex()

  // Safety timeout - if mount takes more than 10 seconds, release mutex
  // This prevents deadlocks in case of errors
  const timeoutId = setTimeout(() => {
    log.warn('Svelte mount timeout - releasing mutex')
    releaseMutex()
  }, 10000)

  try {
    const result = await mountWithMutex(filePath, options, () => {
      clearTimeout(timeoutId)
      releaseMutex()
    })
    clearTimeout(timeoutId)
    return result
  } catch (e) {
    clearTimeout(timeoutId)
    releaseMutex()
    throw e
  }
}

const mountWithMutex = async (
  filePath: string,
  options: { props?: ComponentProps; context?: Record<PropertyKey, unknown> },
  releaseMutex: () => void,
): Promise<MountResult> => {
  const doc = getDocument()
  if (!doc) {
    throw new Error('Failed to initialize DOM. Is happy-dom installed?')
  }

  const win = getWindow()
  if (!win) {
    throw new Error('Failed to initialize window. Is happy-dom installed?')
  }

  // Ensure globals are set before Svelte initialization
  // Using type assertion to handle happy-dom types conflicting with global types
  Object.assign(globalThis, {
    document: doc,
    window: win,
    self: win,
    setTimeout: win.setTimeout,
    setInterval: win.setInterval,
    clearTimeout: win.clearTimeout,
    clearInterval: win.clearInterval,
  })

  await initSvelte()

  // Ensure any previously mounted component is properly unmounted before mounting a new one
  // This prevents issues with Svelte's internal state (listeners Map) getting corrupted
  // when tests run in parallel
  await safeUnmount()

  // Resolve #lib/ or other #-prefixed import map specifiers for component paths
  // e.g. component: '#lib/MyComponent.svelte' should resolve via the package.json imports
  let resolvedPath: string
  if (filePath.startsWith('#')) {
    const pkgJsonPath = await findNearestPackageJson(filePath)
    const resolved = await resolveImportMapSpecifier(filePath, pkgJsonPath)
    if (resolved) {
      resolvedPath = resolved
    } else {
      // Fall back to treating # as a literal path component if import map resolution fails
      resolvedPath = path.resolve(process.cwd(), filePath)
    }
  } else {
    resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
  }

  const exists = await fs.exists(resolvedPath)
  if (!exists) {
    throw new Error(`Svelte component not found: ${resolvedPath}`)
  }

  // Read source to detect $app imports before compilation
  const sourceCode = await fs.readFile(resolvedPath, 'utf-8')

  const detection = await detectSvelteKitImports(sourceCode)
  const usesApp = needsSvelteKitContext(detection)

  // Create isolated context for this mount
  const ctx = createContext()

  // If component uses $app/* imports, set up the context stores (like SvelteKit does)
  if (usesApp) {
    const urlStr = (options.props?.url as string) || 'http://localhost/'
    const urlObj = new URL(urlStr)
    const routeId = (options.props?.routeId as string) || ''
    const params = (options.props?.params as Record<string, string>) || {}
    const data = (options.props?.data as Record<string, unknown>) || {}

    ctx.page.set({
      url: urlObj,
      routeId,
      params,
      data,
      status: 200,
      error: null,
      form: undefined,
    })
  }

  return runWithContext(ctx, async () => {
    // Compile and write synchronously before importing
    const { css, importUrl } = await compileSvelteWithWrite(resolvedPath)

    let mod
    try {
      mod = await import(importUrl)
    } catch (e) {
      const err = is.error(e) ? e : new Error(String(e))
      log.error('Failed to import compiled component:', resolvedPath, err.message)
      throw err
    }
    const Component = mod.default

    const target = document.createElement('div')

    const rawProps = options.props

    if (
      rawProps !== undefined &&
      (!is.object(rawProps) || is.null(rawProps) || is.array(rawProps))
    ) {
      throw new Error(`Props must be an object, got ${typeof rawProps}`)
    }

    const props = rawProps ?? {}

    const rawContext = options.context

    if (
      rawContext !== undefined &&
      (!is.object(rawContext) || is.null(rawContext) || is.array(rawContext))
    ) {
      throw new Error(`Context must be an object, got ${typeof rawContext}`)
    }

    const contextEntries: [PropertyKey, unknown][] | null = rawContext
      ? (Object.entries(rawContext) as [PropertyKey, unknown][])
      : null

    // Process props to convert snippet-like objects to actual Svelte 5 snippets

    const processProps = (propsToProcess: ComponentProps): ComponentProps => {
      const processed: ComponentProps = {}
      for (const [key, value] of Object.entries(propsToProcess)) {
        // Only convert plain objects with render: string or render: fn
        // Skip if already a proper Svelte 5 snippet (render is a function)
        if (is.object(value) && value !== null && !is.array(value)) {
          if ('render' in value) {
            const renderValue = (value as { render: unknown }).render
            // If render is already a function, it's a proper snippet - pass through unchanged
            if (is.fn(renderValue)) {
              processed[key] = value
              continue
            }
            // Otherwise, convert render: string to render: () => string
            const renderFn = is.str(renderValue) ? () => renderValue : (renderValue as () => string)
            processed[key] = renderFn
            continue
          }
        }
        // Leave everything else as-is (strings, functions, numbers, etc.)
        processed[key] = value
      }
      return processed
    }

    const processedProps = svelteCreateRawSnippet ? processProps(props) : props

    for (const key of Reflect.ownKeys(props)) {
      if (!is.string(key)) {
        throw new Error(`Prop keys must be strings, got ${typeof key}`)
      }
    }

    let component: SvelteComponent
    try {
      if (!svelteMount) {
        throw new Error('Svelte not initialized')
      }
      const rootComponent =
        contextEntries && contextEntries.length > 0
          ? wrapWithContext(Component as (...args: unknown[]) => unknown, contextEntries)
          : Component
      component = svelteMount(rootComponent, {
        target,
        props: processedProps,
      })
    } catch (mountError) {
      if (
        is.instance(mountError, Error) &&
        mountError.message.includes('can only be used during component initialisation')
      ) {
        throw new Error(
          `Lifecycle error in ${resolvedPath}: ${mountError.message}. Make sure lifecycle functions are called at the top level of the component script.`,
          { cause: mountError },
        )
      }

      if (is.error(mountError) && mountError.message.includes('https://svelte.dev/')) {
        throw new Error(`[svelte] ${mountError.message} ${resolvedPath}`, { cause: mountError })
      }

      throw mountError
    }

    // Wait for initial effects to run (e.g., $effect) before returning
    if (svelteTick) {
      await svelteTick()
    }

    // If wrapper exposed the inner component, use that as the component instance
    if (component && is.object(component) && '__inner' in component) {
      component = component.__inner
    }

    const unmount = async () => {
      // Only unmount if this is the currently mounted component
      if (mountedComponent !== component) {
        return
      }

      if (!svelteUnmount) {
        throw new Error('Svelte not initialized')
      }

      try {
        await runWithContext(ctx, async () => {
          try {
            await svelteUnmount!(component, { outro: true })
          } catch (unmountError) {
            // Ignore Svelte internal errors during unmount
            // These can happen due to corrupted listeners Map state
            // This is expected when safeUnmount cleans up after a previous test
            if (
              is.instance(unmountError, Error) &&
              unmountError.message.includes('Cannot read properties')
            ) {
              // Silently ignore - this is expected during cleanup
            } else {
              throw unmountError
            }
          }
        })
      } finally {
        // Clear mounted state only if this component is still the mounted one
        if (mountedComponent === component) {
          mountedComponent = null
          mountedInternalUnmount = null
          if (mountedTarget === target) {
            mountedTarget = null
          }
        }
      }
    }

    // Track this as the currently mounted component
    mountedComponent = component
    mountedInternalUnmount = unmount
    mountedTarget = target

    // Return wrapped unmount that releases the mutex after completion
    const wrappedUnmount = async () => {
      try {
        await unmount()
      } finally {
        releaseMutex()
      }
    }

    return { target, component, unmount: wrappedUnmount, css }
  })
}
