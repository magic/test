import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import fs from '@magic/fs'
import log from '@magic/log'
import is from '@magic/types'

import { compileSvelteWithWrite, compileSvelte } from './compile.ts'
import { initDOM, getDocument, getWindow } from '../dom.ts'
import type { ComponentProps } from '../../types.ts'
import { detectSvelteKitImports } from './detect-sveltekit-imports.js'
import { reset as resetState } from './shim-$app/state.ts'
import { reset as resetNav } from './shim-$app/navigation.ts'

const TMP_DIR = 'test/.tmp'

let svelteMount: Function | undefined

let svelteUnmount: Function | undefined

let svelteCreateRawSnippet: Function | null = null

let svelteTick: Function | undefined

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
    throw new Error(`Failed to initialize Svelte: ${err.message}`)
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
  if (!svelteTick) throw new Error('Svelte not initialized')
  await svelteTick()
}

export const mount = async (filePath: string, options: { props?: ComponentProps } = {}) => {
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

   // Reset shim state for test isolation
   resetState();
   resetNav();

   const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)

  const exists = await fs.exists(resolvedPath)
  if (!exists) {
    throw new Error(`Svelte component not found: ${resolvedPath}`)
  }

   // Read source to detect $app imports before compilation
   const sourceCode = await fs.readFile(resolvedPath, 'utf-8')
   const { detectSvelteKitImports, needsSvelteKitContext } = await import('./detect-sveltekit-imports.js')
   const detection = await detectSvelteKitImports(sourceCode)
   const usesApp = needsSvelteKitContext(detection)

  const { js, css, importUrl } = await compileSvelteWithWrite(resolvedPath)



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

  if (rawProps !== undefined && (!is.object(rawProps) || is.null(rawProps) || is.array(rawProps))) {
    throw new Error(`Props must be an object, got ${typeof rawProps}`)
  }

  const props = rawProps ?? {}

  // Process props to convert snippet-like objects to actual Svelte 5 snippets

  const processProps = (propsToProcess: ComponentProps): ComponentProps => {
    const processed: ComponentProps = {}
    for (const [key, value] of Object.entries(propsToProcess)) {
      // Only convert explicit snippet-like objects: { render: fn } or { render: "string" }
      // Don't auto-convert strings or functions - that breaks normal props like href, value, etc.
      if (is.object(value) && value !== null && !is.array(value)) {
        if ('render' in value && !is.fn(value)) {
          // Convert to Svelte 5 snippet
          const renderFn = is.str(value.render) ? () => value.render : value.render
          processed[key] = svelteCreateRawSnippet!(() => ({ render: renderFn }))
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
    const err = mountError as Error
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

   // Wait for initial effects to run (e.g., $effect) before returning
   if (svelteTick) {
     await svelteTick()
   }

   // If wrapper exposed the inner component, use that as the component instance
   if (component && typeof component === 'object' && '__inner' in component) {
     component = component.__inner;
   }

   const unmount = async () => {
    if (!svelteUnmount) throw new Error('Svelte not initialized')
    await svelteUnmount(component, { outro: true })
  }

  return { target, component, unmount, css }
}
