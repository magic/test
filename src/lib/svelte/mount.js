import path from 'node:path'
import fs from '@magic/fs'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { compileSvelteWithImports } from './compile.js'
import { initDOM, getDocument, getWindow } from './dom.js'
import is from '@magic/types'

const TMP_DIR = 'test/.tmp'

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

  // Ensure DOM globals are set before Svelte initializes
  initDOM()

  const sveltePath = path.join(process.cwd(), 'node_modules/svelte/src/index-client.js')
  const require = createRequire(import.meta.url)
  const svelte = require(sveltePath)
  svelteMount = svelte.mount
  svelteUnmount = svelte.unmount
  svelteCreateRawSnippet = svelte.createRawSnippet
  svelteTick = svelte.tick
  svelteInitialized = true
}

// Initialize Svelte at module load so createSnippet works
initSvelte()

/**
 * Create a raw snippet for passing as children prop
 * @param {string} renderFn - Function that returns HTML string
 */
export const createSnippet = renderFn => {
  if (!svelteCreateRawSnippet) {
    throw new Error('Svelte not initialized. Make sure to call mount() first.')
  }
  return svelteCreateRawSnippet(() => ({ render: renderFn }))
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
 * @param {{ props?: object }} [options]
 */
export const mount = async (filePath, options = {}) => {
  initDOM()

  const doc = getDocument()
  if (!doc) {
    throw new Error('Failed to initialize DOM. Is happy-dom installed?')
  }

  const win = getWindow()
  if (!win) {
    throw new Error('Failed to initialize window. Is happy-dom installed?')
  }

  // Ensure globals are set before Svelte initialization
  // @ts-ignore - happy-dom types conflict with global types
  globalThis.document = doc
  // @ts-ignore - happy-dom types conflict with global types
  globalThis.window = win
  // @ts-ignore - happy-dom types conflict with global types
  globalThis.self = win

  await initSvelte()

  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)

  const exists = await fs.exists(resolvedPath)
  if (!exists) {
    throw new Error(`Svelte component not found: ${resolvedPath}`)
  }

  const { js, css } = await compileSvelteWithImports(resolvedPath)

  const relPath = path.relative(process.cwd(), resolvedPath)
  const tmpFile = path.join(TMP_DIR, relPath.replace(/\.svelte$/, '.svelte.js'))
  const importPath = pathToFileURL(tmpFile).href

  const tmpExists = await fs.exists(importPath)
  if (!tmpExists) {
    await fs.mkdirp(path.dirname(tmpFile))
    await fs.writeFile(tmpFile, js.code)
  }

  const mod = await import(importPath)
  const Component = mod.default

  const target = document.createElement('div')

  const rawProps = options.props

  if (
    rawProps !== undefined &&
    (typeof rawProps !== 'object' || rawProps === null || is.array(rawProps))
  ) {
    throw new Error(`Props must be an object, got ${typeof rawProps}`)
  }

  const props = rawProps ?? {}

  for (const key of Object.keys(props)) {
    if (!is.string(key)) {
      throw new Error(`Prop keys must be strings, got ${typeof key}`)
    }
  }

  let component
  try {
    component = svelteMount(Component, {
      target,
      props,
    })
  } catch (/** @type {any} */ mountError) {
    if (mountError.message.includes('can only be used during component initialisation')) {
      throw new Error(
        `Lifecycle error: ${mountError.message}. Make sure lifecycle functions are called at the top level of the component script.`,
        { cause: mountError },
      )
    }
    throw mountError
  }

  const unmount = async () => {
    await svelteUnmount(component, { outro: true })
  }

  return { target, component, unmount, css }
}
