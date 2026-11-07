import { createRequire } from 'node:module'
import is from '@magic/types'

// Type-only import: erased at compile time, no runtime native-module load.
import type { Canvas } from '@napi-rs/canvas/node-canvas.js'

type CanvasModule = typeof import('@napi-rs/canvas/node-canvas.js')

let canvasModule: CanvasModule | null = null
let canvasLoadError: Error | null = null

// Load the canvas native module lazily on first use instead of at module
// load. This repo's polyfill used to import the native binding
// unconditionally, so a broken environment (missing system library,
// prebuild/ABI mismatch) took down the whole run at collection time and in
// every worker. Now:
// - projects whose tests never touch canvas never load the native module,
// - a load failure surfaces as a catchable error in the one test that needs
//   canvas, with an actionable message (see .plans/FIX_HANG.md, B5).
const getCanvasModule = (): CanvasModule => {
  if (canvasModule) {
    return canvasModule
  }
  if (canvasLoadError) {
    throw canvasLoadError
  }
  try {
    const require = createRequire(import.meta.url)
    const mod = require('@napi-rs/canvas/node-canvas.js') as CanvasModule
    canvasModule = mod
    return mod
  } catch (e) {
    canvasLoadError = e instanceof Error ? e : new Error(String(e))
    throw canvasLoadError
  }
}

let origGetContext: ((type: string, ...args: unknown[]) => unknown) | null = null

export const createCanvasPolyfill = (): void => {
  const HTMLCanvasElement = globalThis.HTMLCanvasElement as unknown as {
    prototype: {
      getContext: (type: string, ...args: unknown[]) => unknown
      width: number
      height: number
    }
  }

  if (origGetContext) {
    return
  }

  origGetContext = HTMLCanvasElement.prototype.getContext

  HTMLCanvasElement.prototype.getContext = function (
    this: { width: number; height: number; _nodeCanvas?: Canvas },
    type: string,
    ...args: unknown[]
  ): unknown {
    if (type !== '2d') {
      return origGetContext!.call(this, type, ...args)
    }

    // First real canvas use: load the native module here. A broken native
    // module throws a catchable Error that fails this test (and the suite),
    // instead of aborting the whole process at startup.
    const { createCanvas, Image: NativeImage, loadImage, Canvas: NativeCanvas } = getCanvasModule()

    if (!this._nodeCanvas) {
      this._nodeCanvas = createCanvas(this.width || 300, this.height || 150)
    }

    const ctx = this._nodeCanvas.getContext('2d')

    // The runtime napi-rs 2d context speaks the node-canvas API (variable
    // drawImage args, toDataURL on the context) which does not match the DOM
    // lib types for SKRSContext2D, so the polyfill installs its shims through
    // this locally-typed view. The original methods are kept for delegation.
    const shim = ctx as unknown as {
      drawImage: (image: unknown, ...args: unknown[]) => void
      toDataURL?: (mimeType?: string, quality?: number) => string
    }
    const originalDrawImage = shim.drawImage.bind(shim)
    // napi-rs keeps encoding on the canvas object, not the 2d context
    const originalToDataURL = this._nodeCanvas.toDataURL.bind(this._nodeCanvas) as (
      mimeType?: string,
      quality?: number,
    ) => string

    const drawImageFn = (img: unknown, ...drawArgs: unknown[]): void => {
      if (!is.object(img)) {
        originalDrawImage(img, ...drawArgs)
        return
      }
      const imgLike = img as { _nodeCanvasImage?: unknown; src?: string }

      if (is.instance(img, NativeImage) || (imgLike && imgLike._nodeCanvasImage)) {
        const nodeImg = is.instance(img, NativeImage) ? img : imgLike._nodeCanvasImage
        originalDrawImage(nodeImg, ...drawArgs)
        return
      }

      if (is.instance(img, NativeCanvas)) {
        originalDrawImage(img, ...drawArgs)
        return
      }

      const imgSrc = imgLike?.src
      if (is.string(imgSrc) && imgSrc.startsWith('data:image')) {
        loadImage(imgSrc)
          .then(loadedImg => {
            originalDrawImage(loadedImg, ...drawArgs)
          })
          .catch(() => {})
        return
      }

      originalDrawImage(img, ...drawArgs)
    }

    const toDataURLFn = (mimeType = 'image/png', quality?: number): string =>
      originalToDataURL(mimeType, quality) || ''

    shim.drawImage = drawImageFn
    shim.toDataURL = toDataURLFn

    return ctx
  }
}
