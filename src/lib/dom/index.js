import { createRequire } from 'node:module'
import is from '@magic/types'

/** @type {import('happy-dom').Window | null} */
let happyWindow = null
/** @type {import('happy-dom').Document | null} */
let happyDocument = null
/** @type {import('canvas').Canvas | null} */
let nodeCanvas = null

/**
 * @param {Record<string, unknown>} target
 * @param {string|symbol} key
 * @param {unknown} value
 */
const define = (target, key, value) => {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  })
}

/**
 * Parse PNG dimensions from a base64 data URL
 * @param {string} dataUrl - The data URL to parse
 * @returns {{ width: number, height: number }}
 */
const parsePngDimensions = dataUrl => {
  try {
    const base64 = dataUrl.split(',')[1]
    if (!base64) return { width: 1, height: 1 }

    const binary = atob(base64.slice(0, 100))
    if (binary.length < 24) return { width: 1, height: 1 }

    const width =
      (binary.charCodeAt(16) << 24) |
      (binary.charCodeAt(17) << 16) |
      (binary.charCodeAt(18) << 8) |
      binary.charCodeAt(19)
    const height =
      (binary.charCodeAt(20) << 24) |
      (binary.charCodeAt(21) << 16) |
      (binary.charCodeAt(22) << 8) |
      binary.charCodeAt(23)

    return { width: width || 1, height: height || 1 }
  } catch {
    return { width: 1, height: 1 }
  }
}

// Cache for pre-loaded node-canvas images
const imageCache = new Map()

/**
 * Create Image loading polyfill for happy-dom
 * Pre-loads images with node-canvas for canvas drawing support
 * @param {import('happy-dom').Window} happyWindow
 * @returns {any}
 */
const createImagePolyfill = happyWindow => {
  const OriginalImage = happyWindow.Image
  const HTMLImageElement = happyWindow.HTMLImageElement
  // @ts-ignore - property descriptor types
  const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
  const createRequireFn = createRequire(import.meta.url)

  /**
   * @constructor
   */
  const PolyfilledImage = function () {
    // @ts-ignore - OriginalImage constructor
    const img = new OriginalImage()
    return img
  }

  // @ts-ignore - prototype manipulation
  PolyfilledImage.prototype = OriginalImage.prototype
  // @ts-ignore
  PolyfilledImage.prototype.constructor = PolyfilledImage

  // @ts-ignore - custom property
  PolyfilledImage.prototype._nodeCanvasImage = null
  // @ts-ignore
  PolyfilledImage.prototype.onload = null
  // @ts-ignore
  PolyfilledImage.prototype.addEventListener = function () {}
  // @ts-ignore
  PolyfilledImage.prototype.dispatchEvent = function () {
    return true
  }

  Object.defineProperty(PolyfilledImage.prototype, 'src', {
    /** @this {any} */
    get() {
      // @ts-ignore
      if (srcDesc.get) return srcDesc.get.call(this)
      return ''
    },
    /** @this {any} */
    set(value) {
      if (value && value.startsWith('data:image')) {
        const { width, height } = parsePngDimensions(value)

        // @ts-ignore
        if (srcDesc.set) srcDesc.set.call(this, value)

        // Set dimensions using defineProperty
        Object.defineProperty(this, 'width', {
          value: width,
          writable: true,
          configurable: true,
          enumerable: true,
        })
        Object.defineProperty(this, 'height', {
          value: height,
          writable: true,
          configurable: true,
          enumerable: true,
        })
        Object.defineProperty(this, 'complete', {
          value: true,
          writable: true,
          configurable: true,
          enumerable: true,
        })

        // Pre-load with node-canvas for canvas drawing support
        const { loadImage: nodeLoadImage } = createRequireFn('canvas')
        /** @type {any} */
        const img = this
        nodeLoadImage(value)
          .then(
            /** @param {any} nodeImg */ nodeImg => {
              img._nodeCanvasImage = nodeImg

              if (img.onload) {
                // @ts-ignore
                img.onload.call(img, new Event('load'))
              }
              // @ts-ignore
              if (typeof img.addEventListener === 'function') {
                // @ts-ignore
                img.dispatchEvent(new Event('load'))
              }
            },
          )
          .catch(() => {
            if (img.onload) {
              // @ts-ignore
              img.onload.call(img, new Event('load'))
            }
            // @ts-ignore
            if (typeof img.addEventListener === 'function') {
              // @ts-ignore
              img.dispatchEvent(new Event('load'))
            }
          })
      } else {
        // @ts-ignore
        if (srcDesc.set) srcDesc.set.call(this, value)
      }
    },
    configurable: true,
  })

  return /** @type {any} */ (PolyfilledImage)
}

/**
 * Create Canvas 2D context polyfill using node-canvas
 * Uses lazy loading with createRequire to work in ESM contexts
 * @param {import('happy-dom').Window} happyWindow
 * @param {import('happy-dom').Document} happyDocument
 */
const createCanvasPolyfill = (happyWindow, happyDocument) => {
  const OriginalCanvasElement = happyWindow.HTMLCanvasElement
  // @ts-ignore
  const originalGetContext = OriginalCanvasElement.prototype.getContext
  const createRequireFn = createRequire(import.meta.url)
  const { createCanvas: nodeCreateCanvas, loadImage: nodeLoadImage } = createRequireFn('canvas')

  /**
   * @this {any}
   * @param {string} type
   * @param {any[]} args
   */
  OriginalCanvasElement.prototype.getContext = function (type, ...args) {
    if (type === '2d') {
      const canvas = nodeCreateCanvas(this.width || 300, this.height || 150)
      const ctx = canvas.getContext('2d')

      // Wrap drawImage to handle happy-dom Images
      const originalDrawImage = ctx.drawImage
      /**
       * @this {any}
       * @param {any} img
       * @param {any[]} drawArgs
       */
      ctx.drawImage = function (img, ...drawArgs) {
        // Check if it's a happy-dom Image with pre-loaded node-canvas image
        // @ts-ignore
        if (img && img._nodeCanvasImage) {
          // @ts-ignore
          return originalDrawImage.call(this, img._nodeCanvasImage, ...drawArgs)
        }

        // Check if it's a happy-dom Image (has width/height from data URL)
        // @ts-ignore
        if (img && img.width > 0 && img.height > 0 && img.src && img.src.startsWith('data:image')) {
          try {
            // @ts-ignore
            const nodeImg = nodeLoadImage(img.src)
            return originalDrawImage.call(this, nodeImg, ...drawArgs)
          } catch (e) {
            // Fall through to original
          }
        }

        return originalDrawImage.call(this, img, ...drawArgs)
      }

      return ctx
    }

    if (type === 'webgl' || type === 'webgl2') {
      // @ts-ignore
      return originalGetContext.call(this, type, ...args)
    }

    // @ts-ignore
    return originalGetContext.call(this, type, ...args)
  }

  /**
   * @this {any}
   * @param {string} [mimeType]
   * @param {number} [quality]
   */
  OriginalCanvasElement.prototype.toDataURL = function (mimeType = 'image/png', quality) {
    const canvas = nodeCreateCanvas(this.width || 300, this.height || 150)
    const ctx = canvas.getContext('2d')
    return ctx.toDataURL(mimeType, quality)
  }
}

const initGlobals = () => {
  if (happyWindow) return

  // Dynamic import to make happy-dom optional
  const require = createRequire(import.meta.url)
  const { Window } = require('happy-dom')

  happyWindow = new Window()
  happyDocument = happyWindow.document

  define(globalThis, 'document', happyDocument)
  define(globalThis, 'window', happyWindow)
  define(globalThis, 'self', happyWindow)
  define(globalThis, 'navigator', happyWindow.navigator)
  define(globalThis, 'location', happyWindow.location)
  define(globalThis, 'history', happyWindow.history)

  define(globalThis, 'Node', happyWindow.Node)
  define(globalThis, 'Element', happyWindow.Element)
  define(globalThis, 'HTMLElement', happyWindow.HTMLElement)
  define(globalThis, 'SVGElement', happyWindow.SVGElement)
  define(globalThis, 'Document', happyWindow.Document)
  define(globalThis, 'DocumentFragment', happyWindow.DocumentFragment)
  define(globalThis, 'Comment', happyWindow.Comment)
  define(globalThis, 'Text', happyWindow.Text)

  define(globalThis, 'Event', happyWindow.Event)
  define(globalThis, 'CustomEvent', happyWindow.CustomEvent)
  define(globalThis, 'MouseEvent', happyWindow.MouseEvent)
  define(globalThis, 'KeyboardEvent', happyWindow.KeyboardEvent)
  define(globalThis, 'InputEvent', happyWindow.InputEvent)
  define(globalThis, 'TouchEvent', happyWindow.TouchEvent)
  define(globalThis, 'PointerEvent', happyWindow.PointerEvent)
  define(globalThis, 'FormData', happyWindow.FormData)
  define(globalThis, 'File', happyWindow.File)
  define(globalThis, 'FileList', happyWindow.FileList)
  define(globalThis, 'Blob', happyWindow.Blob)
  define(globalThis, 'URL', happyWindow.URL)
  define(globalThis, 'URLSearchParams', happyWindow.URLSearchParams)

  define(globalThis, 'MutationObserver', happyWindow.MutationObserver)
  define(globalThis, 'IntersectionObserver', happyWindow.IntersectionObserver)
  define(globalThis, 'ResizeObserver', happyWindow.ResizeObserver)
  define(globalThis, 'PerformanceObserver', happyWindow.PerformanceObserver)

  // File API
  define(globalThis, 'FileReader', happyWindow.FileReader)

  // Image and Canvas - with polyfills
  const PolyfilledImage = createImagePolyfill(happyWindow)
  define(globalThis, 'Image', PolyfilledImage)
  define(globalThis, 'HTMLImageElement', happyWindow.HTMLImageElement)

  createCanvasPolyfill(happyWindow, happyDocument)
  define(globalThis, 'HTMLCanvasElement', happyWindow.HTMLCanvasElement)

  // Encoding APIs
  define(globalThis, 'TextEncoder', happyWindow.TextEncoder)
  define(globalThis, 'TextDecoder', happyWindow.TextDecoder)
  define(globalThis, 'atob', happyWindow.atob)
  define(globalThis, 'btoa', happyWindow.btoa)

  // Note: Don't define globalThis.crypto here - Node.js has excellent crypto support
  // and replacing it with happy-dom's crypto breaks subtle.digest

  // Storage
  define(globalThis, 'Storage', happyWindow.Storage)
  define(globalThis, 'sessionStorage', happyWindow.sessionStorage)
  define(globalThis, 'localStorage', happyWindow.localStorage)

  // Fetch APIs
  define(globalThis, 'Headers', happyWindow.Headers)
  define(globalThis, 'Request', happyWindow.Request)
  define(globalThis, 'Response', happyWindow.Response)
  define(globalThis, 'AbortController', happyWindow.AbortController)
  define(globalThis, 'AbortSignal', happyWindow.AbortSignal)

  // Streams
  define(globalThis, 'ReadableStream', happyWindow.ReadableStream)
  define(globalThis, 'WritableStream', happyWindow.WritableStream)
  define(globalThis, 'TransformStream', happyWindow.TransformStream)

  // XML
  define(globalThis, 'XMLHttpRequest', happyWindow.XMLHttpRequest)
  define(globalThis, 'DOMParser', happyWindow.DOMParser)
  define(globalThis, 'XMLSerializer', happyWindow.XMLSerializer)

  // WebSocket
  define(globalThis, 'WebSocket', happyWindow.WebSocket)

  // Custom Elements
  define(globalThis, 'CustomElementRegistry', happyWindow.CustomElementRegistry)

  // MessagePort
  define(globalThis, 'MessagePort', happyWindow.MessagePort)

  // Media
  define(globalThis, 'MediaStream', happyWindow.MediaStream)
  define(globalThis, 'MediaStreamTrack', happyWindow.MediaStreamTrack)

  // Audio
  define(globalThis, 'Audio', happyWindow.Audio)

  // All HTML element constructors
  for (const [key, value] of Object.entries(happyWindow)) {
    if (key.startsWith('HTML') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  // All SVG element constructors
  for (const [key, value] of Object.entries(happyWindow)) {
    if (key.startsWith('SVG') && is.fn(value)) {
      define(globalThis, key, value)
    }
  }

  define(globalThis, 'globalThis', globalThis)

  define(globalThis, 'setTimeout', happyWindow.setTimeout)
  define(globalThis, 'clearTimeout', happyWindow.clearTimeout)
  define(globalThis, 'setInterval', happyWindow.setInterval)
  define(globalThis, 'clearInterval', happyWindow.clearInterval)

  define(globalThis, 'requestAnimationFrame', happyWindow.requestAnimationFrame)
  define(globalThis, 'cancelAnimationFrame', happyWindow.cancelAnimationFrame)

  define(globalThis, 'fetch', happyWindow.fetch)
  define(globalThis, 'queueMicrotask', happyWindow.queueMicrotask)
}

export const initDOM = () => {
  initGlobals()
}

export const getDocument = () => {
  initGlobals()
  return happyDocument
}

export const getWindow = () => {
  initGlobals()
  return happyWindow
}

export const isInitialized = () => happyWindow !== null
