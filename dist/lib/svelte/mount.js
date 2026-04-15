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
const initSvelte = async () => {
  if (svelteInitialized) return
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
  if (!svelteTick) throw new Error('Svelte not initialized')
  await svelteTick()
}
export const mount = async (filePath, options = {}) => {
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
      if (!svelteUnmount) throw new Error('Svelte not initialized')
      await runWithContext(ctx, async () => {
        await svelteUnmount(component, { outro: true })
      })
    }
    return { target, component, unmount, css }
  })
}
