var __rewriteRelativeImportExtension =
  (this && this.__rewriteRelativeImportExtension) ||
  function (path, preserveJsx) {
    if (typeof path === 'string' && /^\.\.?\//.test(path)) {
      return path.replace(
        /\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,
        function (m, tsx, d, ext, cm) {
          return tsx
            ? preserveJsx
              ? '.jsx'
              : '.js'
            : d && (!ext || !cm)
              ? m
              : d + ext + '.' + cm.toLowerCase() + 'js'
        },
      )
    }
    return path
  }
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'
import { compileSvelteWithWrite } from './compile/index.js'
import { initDOM, getDocument, getWindow } from '../../lib/dom/index.js'
import { createContext, runWithContext } from './shims/$app/state.js'
import { detectSvelteKitImports, needsSvelteKitContext } from './detect-sveltekit-imports.js'
let svelteMount
let svelteUnmount
let svelteCreateRawSnippet = null
let svelteTick
let svelteInitialized = false
// Track mounted component state to ensure proper cleanup per-test
let mountedComponent = null
let mountedInternalUnmount = null
let mountedTarget = null
let mountedContext = null
// Mutex to ensure only one Svelte component test runs at a time
// This prevents race conditions in Svelte's internal listeners Map
let svelteMutex = Promise.resolve()
const acquireMutex = async () => {
  let release
  const released = new Promise(resolve => {
    release = resolve
  })
  const current = svelteMutex
  svelteMutex = released
  await current
  return release
}
/**
 * Safely unmount the current component if one exists.
 * This ensures clean state before mounting a new component.
 * Called while holding the mutex, so uses internal unmount (doesn't release mutex).
 */
const safeUnmount = async () => {
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
  mountedContext = null
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
export const createSnippet = renderFn => {
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
    if (e instanceof Error && e.message.includes('Cannot read properties')) {
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
export const mount = async (filePath, options = {}) => {
  // Acquire mutex to ensure only one Svelte component test runs at a time
  const releaseMutex = await acquireMutex()
  // Safety timeout - if mount takes more than 60 seconds, release mutex
  // This prevents deadlocks in case of errors
  const timeoutId = setTimeout(() => {
    log.warn('Svelte mount timeout - releasing mutex')
    releaseMutex()
  }, 60000)
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
const mountWithMutex = async (filePath, options, releaseMutex) => {
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
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
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
    const urlStr = options.props?.url || 'http://localhost/'
    const urlObj = new URL(urlStr)
    const routeId = options.props?.routeId || ''
    const params = options.props?.params || {}
    const data = options.props?.data || {}
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
      mod = await import(__rewriteRelativeImportExtension(importUrl))
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
    // Process props to convert snippet-like objects to actual Svelte 5 snippets
    const processProps = propsToProcess => {
      const processed = {}
      for (const [key, value] of Object.entries(propsToProcess)) {
        // Only convert explicit snippet-like objects: { render: fn } or { render: "string" }
        // Don't auto-convert strings or functions - that breaks normal props like href, value, etc.
        if (is.object(value) && value !== null && !is.array(value)) {
          if ('render' in value && !is.fn(value)) {
            const renderValue = value.render
            const renderFn = is.str(renderValue) ? () => renderValue : renderValue
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
    let component
    try {
      if (!svelteMount) {
        throw new Error('Svelte not initialized')
      }
      component = svelteMount(Component, {
        target,
        props: processedProps,
      })
    } catch (mountError) {
      if (
        mountError instanceof Error &&
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
            await svelteUnmount(component, { outro: true })
          } catch (unmountError) {
            // Ignore Svelte internal errors during unmount
            // These can happen due to corrupted listeners Map state
            // This is expected when safeUnmount cleans up after a previous test
            if (
              unmountError instanceof Error &&
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
          mountedContext = null
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
    mountedContext = ctx
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
