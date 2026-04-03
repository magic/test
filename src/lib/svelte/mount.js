import { createRequire } from 'node:module'
import path from 'node:path'

import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { compileSvelteWithWrite } from './compile.js'
import { initDOM, getDocument, getWindow } from '../dom/index.js'

/** @typedef {import('../../types.ts').ComponentProps} ComponentProps */

/** @type {Function} */
let svelteMount
/** @type {Function} */
let svelteUnmount
/** @type {Function} */
let svelteCreateRawSnippet
/** @type {Function} */
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
    const err = /** @type {Error} */ (e)
    throw new Error(`Failed to initialize Svelte: ${err.message}`)
  }
}

/**
 * Create a raw snippet for passing as children prop
 * @param {string | (() => string)} renderFn - Function that returns HTML string
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
  await svelteTick()
}

/**
 * @param {string} filePath
 * @param {{ props?: ComponentProps }} [options]
 */
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

  const { js, css, importUrl } = await compileSvelteWithWrite(resolvedPath)

  let mod
  try {
    mod = await import(importUrl)
  } catch (e) {
    const err = /** @type {Error} */ (e)
    log.error('Failed to import compiled component:', resolvedPath, err.message)
    throw err
  }
  const Component = mod.default

  const target = document.createElement('div')

  const rawProps = options.props

  if (rawProps !== undefined && (!is.object(rawProps) || is.null(rawProps) || is.array(rawProps))) {
    throw new Error(`Props must be an object, got ${typeof rawProps}`)
  }

  const props = rawProps ?? {}

  // Process props to convert snippet-like objects to actual Svelte 5 snippets
  /**
   * @param {Record<string, any>} propsToProcess
   * @returns {Record<string, any>}
   */
  const processProps = propsToProcess => {
    /** @type {Record<string, any>} */
    const processed = {}
    for (const [key, value] of Object.entries(propsToProcess)) {
      // Only convert explicit snippet-like objects: { render: fn } or { render: "string" }
      // Don't auto-convert strings or functions - that breaks normal props like href, value, etc.
      if (is.object(value) && value !== null && !is.array(value)) {
        if ('render' in value && !is.fn(value)) {
          // Convert to Svelte 5 snippet
          const renderFn = is.str(value.render) ? () => value.render : value.render
          processed[key] = svelteCreateRawSnippet(() => ({ render: renderFn }))
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
    component = svelteMount(Component, {
      target,
      props: processedProps,
    })
  } catch (/** @type {unknown} */ mountError) {
    const err = /** @type {Error} */ (mountError)
    if (err.message.includes('can only be used during component initialisation')) {
      throw new Error(
        `Lifecycle error in ${resolvedPath}: ${err.message}. Make sure lifecycle functions are called at the top level of the component script.`,
        { cause: err },
      )
    }

    if (err.message.includes('https://svelte.dev/')) {
      throw new Error(`[svelte] ${err.message} ${resolvedPath}`, { cause: err })
    }

    throw err
  }

  const unmount = async () => {
    await svelteUnmount(component, { outro: true })
  }

  return { target, component, unmount, css }
}
