import path from 'node:path'
import fs from '@magic/fs'
import { pathToFileURL } from 'node:url'
import { compileSvelteWithImports } from './compile.js'
import { initDOM, getDocument, getWindow } from './dom.js'
import is from '@magic/types'

const TMP_DIR = 'test/.tmp'

/** @type {Function} */
let svelteMount
/** @type {Function} */
let svelteUnmount

/**
 * @param {string} filePath
 * @param {{ props?: object }} [options]
 */
export const mount = async (filePath, options = {}) => {
  initDOM()

  const document = getDocument()
  const happyWindow = getWindow()

  // @ts-ignore - happy-dom types conflict with global types
  globalThis.document = document
  // @ts-ignore - happy-dom types conflict with global types
  globalThis.window = happyWindow
  // @ts-ignore - happy-dom types conflict with global types
  globalThis.self = happyWindow

  if (!svelteMount) {
    const sveltePath = path.join(process.cwd(), 'node_modules/svelte/src/index-client.js')
    const svelteUrl = pathToFileURL(sveltePath).href
    const svelte = await import(svelteUrl)
    svelteMount = svelte.mount
    svelteUnmount = svelte.unmount
  }

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
    if (typeof key !== 'string') {
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
